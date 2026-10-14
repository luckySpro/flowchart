use std::{fs, io::Write, path::Path};

const MAX_BYTES: usize = 5 * 1024 * 1024;

pub fn validate(document: &str) -> Result<(), String> {
    if document.len() > MAX_BYTES {
        return Err("草稿超过 5 MB".into());
    }
    let value: serde_json::Value = serde_json::from_str(document).map_err(|_| "草稿 JSON 无效")?;
    if value["schema"].as_u64() != Some(1)
        || !matches!(
            value["scene"].as_str(),
            Some("architecture" | "flow" | "uml" | "er" | "network")
        )
        || value["title"]
            .as_str()
            .is_none_or(|s| s.chars().count() > 120)
    {
        return Err("不兼容的草稿格式".into());
    }
    let cells = value["graph"]["cells"].as_array().ok_or("缺少图形数据")?;
    if cells.len() > 2000 {
        return Err("节点与连线总数超过 2000".into());
    }
    for cell in cells {
        if !matches!(cell["shape"].as_str(), Some("studio-node" | "studio-edge"))
            || cell.get("attrs").is_some()
            || cell.get("markup").is_some()
            || cell.get("tools").is_some()
        {
            return Err("草稿包含不支持的图形属性".into());
        }
        if let Some(fields) = cell["data"].get("fields") {
            let fields = fields.as_array().ok_or("字段必须是数组")?;
            if fields.len() > 50 {
                return Err("每张表最多 50 个字段".into());
            }
            let mut names = std::collections::HashSet::new();
            for field in fields {
                let name = field["name"].as_str().ok_or("字段名无效")?.trim();
                let data_type = field["type"].as_str().ok_or("字段类型无效")?.trim();
                let key = field["key"].as_str().ok_or("字段键约束无效")?;
                let nullable = field["nullable"].as_bool().ok_or("可空约束无效")?;
                if name.is_empty()
                    || name.chars().count() > 64
                    || !names.insert(name.to_lowercase())
                    || data_type.is_empty()
                    || data_type.chars().count() > 48
                    || !matches!(key, "" | "PK" | "FK")
                    || (key == "PK" && nullable)
                {
                    return Err("字段名称、类型或约束无效".into());
                }
            }
        }
    }
    Ok(())
}

pub fn save(directory: &Path, document: &str) -> Result<(), String> {
    validate(document)?;
    fs::create_dir_all(directory).map_err(|e| format!("无法创建数据目录：{e}"))?;
    let temporary = directory.join("draft.tmp");
    let result = (|| {
        let mut options = fs::OpenOptions::new();
        options.write(true).create(true).truncate(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let mut file = options.open(&temporary)?;
        file.write_all(document.as_bytes())?;
        file.sync_all()?;
        fs::rename(&temporary, directory.join("draft.json"))
    })();
    if let Err(e) = result {
        let _ = fs::remove_file(temporary);
        return Err(format!("草稿未能写入磁盘：{e}"));
    }
    Ok(())
}

pub fn load(directory: &Path) -> Result<Option<String>, String> {
    let path = directory.join("draft.json");
    let metadata = match fs::metadata(&path) {
        Ok(m) => m,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(e) => return Err(format!("草稿无法读取：{e}")),
    };
    if metadata.len() > MAX_BYTES as u64 {
        return Err("草稿超过 5 MB".into());
    }
    let document = fs::read_to_string(path).map_err(|e| format!("草稿无法读取：{e}"))?;
    validate(&document)?;
    Ok(Some(document))
}

#[cfg(test)]
mod tests {
    use super::*;
    const VALID: &str =
        r#"{"schema":1,"scene":"architecture","title":"架构图","graph":{"cells":[]}}"#;
    #[test]
    fn rejects_invalid_and_unsafe_documents() {
        assert!(validate(VALID).is_ok());
        assert!(validate("not json").is_err());
        assert!(validate(&VALID.replace("\"schema\":1", "\"schema\":2")).is_err());
        assert!(validate(&" ".repeat(MAX_BYTES + 1)).is_err());
        assert!(validate(&VALID.replace("[]", r#"[{"shape":"studio-node","attrs":{}}]"#)).is_err());
    }
    #[test]
    fn rejects_invalid_structured_fields() {
        let fields = r#"[{"shape":"studio-node","data":{"fields":[{"name":"id","type":"UUID","key":"PK","nullable":false}]}}]"#;
        let document = VALID.replace("[]", fields);
        assert!(validate(&document).is_ok());
        assert!(validate(&document.replace("\"nullable\":false", "\"nullable\":true")).is_err());
        assert!(validate(&document.replace("\"name\":\"id\"", "\"name\":\"\"")).is_err());
    }
    #[test]
    fn writes_replaces_and_recovers_draft() {
        let path = std::env::temp_dir().join(format!("xutu-storage-test-{}", std::process::id()));
        assert_eq!(load(&path).unwrap(), None);
        save(&path, VALID).unwrap();
        let revised = VALID.replace("架构图", "新图纸");
        save(&path, &revised).unwrap();
        assert_eq!(load(&path).unwrap(), Some(revised));
        assert!(!path.join("draft.tmp").exists());
        assert!(save(&path, "invalid").is_err());
        assert!(load(&path).unwrap().is_some());
        fs::remove_dir_all(path).unwrap();
    }
}

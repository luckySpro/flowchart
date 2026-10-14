use std::io::Write;
use tauri_plugin_dialog::DialogExt;

pub fn validate_svg(content: &str) -> Result<(), String> {
    if content.len() > 5 * 1024 * 1024 {
        return Err("SVG 超过 5 MB".into());
    }
    let document = roxmltree::Document::parse(content).map_err(|_| "SVG 格式无效")?;
    if document.root_element().tag_name().name() != "svg" {
        return Err("不是 SVG 文档".into());
    }
    for node in document.descendants().filter(|n| n.is_element()) {
        if matches!(
            node.tag_name().name(),
            "script" | "foreignObject" | "image" | "iframe"
        ) {
            return Err("SVG 包含不允许的嵌入内容".into());
        }
        for attribute in node.attributes() {
            let value = attribute.value().trim();
            if attribute.name().to_lowercase().starts_with("on")
                || (attribute.name() == "href" && !value.starts_with('#'))
                || (value.contains("url(") && !value.contains("url(#"))
            {
                return Err("SVG 包含外部引用或脚本属性".into());
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn export_file(
    app: tauri::AppHandle,
    content: String,
    filename: String,
    format: String,
) -> Result<bool, String> {
    match format.as_str() {
        "xutu" => crate::storage::validate(&content)?,
        "svg" => validate_svg(&content)?,
        _ => return Err("不支持的导出格式".into()),
    }
    let safe_name: String = filename
        .chars()
        .filter(|c| !"/\\:\0".contains(*c))
        .take(120)
        .collect();
    tauri::async_runtime::spawn_blocking(move || {
        let choice = app
            .dialog()
            .file()
            .add_filter("序图文件", &[format.as_str()])
            .set_file_name(safe_name)
            .blocking_save_file();
        let Some(choice) = choice else {
            return Ok(false);
        };
        let mut path = choice.into_path().map_err(|e| e.to_string())?;
        if path.extension().is_none() {
            path.set_extension(&format);
        }
        if path.extension().and_then(|e| e.to_str()) != Some(format.as_str()) {
            return Err(format!("请使用 .{format} 扩展名"));
        }
        let directory = path.parent().ok_or("目标目录无效")?;
        let mut temporary =
            tempfile::NamedTempFile::new_in(directory).map_err(|e| format!("无法创建文件：{e}"))?;
        temporary
            .write_all(content.as_bytes())
            .map_err(|e| format!("写入失败：{e}"))?;
        temporary
            .as_file()
            .sync_all()
            .map_err(|e| format!("保存失败：{e}"))?;
        temporary
            .persist(path)
            .map_err(|e| format!("无法完成保存：{e}"))?;
        Ok(true)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn open_document(app: tauri::AppHandle) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let choice = app
            .dialog()
            .file()
            .add_filter("序图图纸", &["xutu", "json"])
            .blocking_pick_file();
        let Some(choice) = choice else {
            return Ok(None);
        };
        let path = choice.into_path().map_err(|e| e.to_string())?;
        let metadata = std::fs::metadata(&path).map_err(|e| format!("文件无法读取：{e}"))?;
        if !metadata.is_file() || metadata.len() > 5 * 1024 * 1024 {
            return Err("请选择小于 5 MB 的图纸文件".into());
        }
        let content = std::fs::read_to_string(path).map_err(|e| format!("读取失败：{e}"))?;
        crate::storage::validate(&content)?;
        Ok(Some(content))
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn svg_allows_internal_markers_but_rejects_active_content() {
        assert!(validate_svg(
            r##"<svg xmlns="http://www.w3.org/2000/svg"><path marker-end="url(#arrow)"/></svg>"##
        )
        .is_ok());
        assert!(validate_svg("<svg><script>alert(1)</script></svg>").is_err());
        assert!(validate_svg(r#"<svg onload="alert(1)"/>"#).is_err());
        assert!(validate_svg(r#"<svg><use href="https://example.org/a.svg"/></svg>"#).is_err());
    }
}

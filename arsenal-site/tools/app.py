from flask import Flask, render_template, url_for
from markupsafe import Markup
from pathlib import Path
import re
import markdown

# --- Path Configuration ---
SITE_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_FOLDER = SITE_ROOT / 'templates'
NOTEBOOK_DIR = SITE_ROOT / 'assets' / 'data' / 'Hawk_Eye_Dev_Notebooks' / '01_Rap_Notebook'

app = Flask(__name__,
            static_folder=SITE_ROOT,
            static_url_path='',
            template_folder=TEMPLATE_FOLDER)

def format_title(text: str):
    """Converts a filename-safe string to a more readable title."""
    return re.sub(r'[_-]', ' ', text).title()

# --- Routes ---
@app.route('/')
def index():
    notebooks = []
    if NOTEBOOK_DIR.exists():
        for f in sorted(NOTEBOOK_DIR.iterdir()):
            if f.is_file() and f.suffix.lower() in ['.html', '.md']:
                notebooks.append({
                    'title': format_title(f.stem),
                    'key': f.stem
                })
    return render_template('index.html', notebooks=notebooks)

@app.route('/notebook/<notebook_key>')
def notebook_page(notebook_key):
    """Renders a single notebook page from HTML or Markdown."""
    file_path_html = NOTEBOOK_DIR / f"{notebook_key}.html"
    file_path_md = NOTEBOOK_DIR / f"{notebook_key}.md"

    content = ""
    if file_path_html.exists():
        content = file_path_html.read_text(encoding='utf-8')
    elif file_path_md.exists():
        md_content = file_path_md.read_text(encoding='utf-8')
        content = markdown.markdown(md_content)
    else:
        return "Notebook not found", 404
    
    return render_template('notebook.html',
        title=format_title(notebook_key),
        content=Markup(content)
    )

if __name__ == '__main__':
    app.run(port=5000, debug=True)

from pathlib import Path
import json
import nbformat as nbf

# Load the full conversation file
json_path = Path("Ever-The-Light-Shines/HawkEyeDEV/mixtape_sessions_conversations.json")  # Update if filename is different
with open(json_path, "r", encoding="utf-8") as f:
    conversation_log = json.load(f)

# Create a new notebook
nb = nbf.v4.new_notebook()
nb.cells = []

# Add a title
nb.cells.append(nbf.v4.new_markdown_cell("# 💬 Mixtape Sessions — Full Conversation Archive"))

# Add each message from the log
for i, message in enumerate(conversation_log):
    role = message.get("role", "unknown").capitalize()
    content = message.get("content", "").strip()
    if content:
        cell_header = f"### {role} Message {i+1}"
        nb.cells.append(nbf.v4.new_markdown_cell(f"{cell_header}\n\n{content}"))

# Save the new notebook
output_file = Path("conversations_archive.ipynb")
with open(output_file, "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print("✅ Notebook created with full conversation log.")
import os

filepath = 'js/ccfolialayoutmaker_ai.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """          generationConfig: {
            responseModalities: ["IMAGE"],
            aspectRatio: aspectRatio
          }"""

replacement = """          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(content)
    print("js update success")
else:
    print("Error: Target not found in js file")

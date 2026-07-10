import re
def minify_html(content):
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    content = re.sub(r'>\s+<', '><', content)
    content = re.sub(r'\s{2,}', ' ', content)
    content = content.strip()
    return content

test_js = """
<script>
  // This is a comment
  console.log("Hello");
</script>
"""
print(f"Original:\n{test_js}")
print(f"Minified:\n{minify_html(test_js)}")

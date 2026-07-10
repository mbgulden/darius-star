import re
def minify_html_fixed(content):
    # Remove HTML comments (not inside script tags)
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)

    # Split by script tags to avoid minifying JS content aggressively
    parts = re.split(r'(<script.*?>.*?</script>)', content, flags=re.DOTALL)
    for i in range(len(parts)):
        if not parts[i].startswith('<script'):
            # Minify HTML parts
            parts[i] = re.sub(r'>\s+<', '><', parts[i])
            parts[i] = re.sub(r'\s{2,}', ' ', parts[i])
        else:
            # For script tags, maybe just trim but don't collapse all spaces
            # as it might break single-line comments //
            pass

    return "".join(parts).strip()

test_js = """
<html>
  <body>
    <!-- some comment -->
    <script>
      // This is a comment
      console.log("Hello");
    </script>
  </body>
</html>
"""
print(f"Fixed Minified:\n{minify_html_fixed(test_js)}")

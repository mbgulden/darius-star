import sys
sys.path.append("/home/ubuntu/work")
from linear_helper import query_linear

team_id = "b6fb2651-5a1f-4714-9bcd-9eb6e759ffef"
ned_label_id = "6e0400c9-fc04-4868-86e3-f3156821f413"

issues_to_create = [
    {
        "title": "[BUG] verify_scaffolding.js broken by package.json type:module",
        "description": "## Problem\nThe addition of `\"type\": \"module\"` to `package.json` in `GRO-1064` broke `tools/verify_scaffolding.js` because it uses CommonJS `require()`. Running `node tools/verify_scaffolding.js` throws a `ReferenceError: require is not defined in ES module scope` error.\n\n## Action Required\nRename `verify_scaffolding.js` to `verify_scaffolding.cjs` or rewrite it to use ES module `import` syntax.",
    },
    {
        "title": "[BUG] audio_chip.js is untracked in Git causing 404 in CI/CD environments",
        "description": "## Problem\n`js/audio_chip.js` exists in the local workspace but is not added or tracked in Git. As a result, when CI/CD or other test environments clone the repository, the file is missing and causes a 404 (File Not Found) network error during runtime load.\n\n## Action Required\nRun `git add js/audio_chip.js` and commit the file to master.",
    },
    {
        "title": "[ARCH] StoryTriggers class in js/story/triggers.js is completely unintegrated",
        "description": "## Problem\nNed created the story trigger hooks in `js/story/triggers.js` to bridge gameplay milestones (such as boss kills, biome transitions, and squad rescues/losses) to the story branching and audio narrations. However, `StoryTriggers` is never called or imported anywhere in `js/game_loop.js` or `js/enemies.js`. As a result, the story progression and branching choices are currently dormant and non-functional.\n\n## Action Required\nIntegrate `StoryTriggers` calls at the appropriate milestones in `game_loop.js` and `enemies.js` (e.g. within boss defeat checks, biome advance, squad save/loss).",
    }
]

for idx, issue in enumerate(issues_to_create):
    q = """
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
        }
      }
    }
    """
    variables = {
        "input": {
            "title": issue["title"],
            "description": issue["description"],
            "teamId": team_id,
            "labelIds": [ned_label_id]
        }
    }
    res = query_linear(q, variables)
    print(f"Issue {idx+1} creation result:", res)

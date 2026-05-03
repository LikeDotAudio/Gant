# Gan't Do it

A procrastination organizer / productivity prioritizer for managing complex life and home projects. It features a hierarchical task management system with visual, spreadsheet, and JSON views.

## Project Structure

- `index.html`: The main entry point and UI layout.
- `server.py`: A lightweight Python server to run the application locally.
- `js/`: Modular JavaScript logic for rendering, file handling, and state management.
- `life/tasks.json`: The default data file containing project tasks and their hierarchy.

## Getting Started

To run the application, you need Python 3 installed on your system.

1. Navigate to the project directory.
2. Run the provided server script:
   ```bash
   python server.py
   ```
3. The script will automatically open your default web browser to `http://localhost:8080`.

## Data Schema (`tasks.json`)

The application uses a specific hierarchical JSON schema to represent the Work Breakdown Structure. The hierarchy is organized into four levels: **Roots**, **Parents**, **Children**, and **Siblings**.

### Root Object
The top-level object in the JSON file.

| Field | Type | Description |
| :--- | :--- | :--- |
| `project` | String | The name of the project. |
| `baseDate` | String | The reference start date for the project (YYYY-MM-DD). |
| `roots` | Array | An array of Root Task objects. |
| `milestones` | Array | An array of project milestones. |

### Task Hierarchy Levels

Each level follows a similar structure but uses specific ID keys and child array keys.

#### 1. Root Level
- **ID Key**: `RootID`
- **Children Key**: `parents`

#### 2. Parent Level (Children of Root)
- **ID Key**: `ParentID`
- **Children Key**: `children`

#### 3. Child Level (Children of Parent)
- **ID Key**: `CHILDID`
- **Children Key**: `siblings`

#### 4. Sibling Level (Children of Child)
- **ID Key**: `siblingID`
- **Children Key**: (Leaf nodes, no children)

### Common Task Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | The display name of the task. |
| `progress` | Number | Completion percentage (0-100). |
| `color` | String | Hex color code for the task bar (e.g., `"#4b6584"`). |
| `type` | String | Set to `"summary"` for nodes that contain children. |

### Schema Example

```json
{
  "project": "My Project",
  "baseDate": "2026-04-29",
  "roots": [
    {
      "RootID": "1",
      "name": "CATEGORY",
      "progress": 25,
      "color": "#4b6584",
      "type": "summary",
      "parents": [
        {
          "ParentID": "1",
          "name": "Parent Task",
          "progress": 0,
          "type": "summary",
          "children": [
            {
              "CHILDID": "1",
              "name": "Sub-task",
              "progress": 0,
              "type": "summary",
              "siblings": [
                { "siblingID": "1", "name": "Work Item", "progress": 0 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Features

- **Multiple Views**: Switch between Visual (Gantt), Spreadsheet, and JSON Source views.
- **Dark Mode**: Optimized for low-light environments.
- **Dynamic Controls**: Zoom, fold/unfold hierarchy levels, and toggle column visibility.
- **File Management**: Save and load projects as JSON or export/import CSV.

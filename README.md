# salesforce-resizable-three-column-template
A custom resizable three-column record page template for Salesforce Service Console UI.

https://github.com/user-attachments/assets/2d69eb0e-dd02-458b-a99b-53c922bb502f

# Resizable Three-Column Record Template

A customized Aura-based Lightning Page template designed to optimize the Salesforce Service Console UI. This component introduces a dynamic, three-column record layout where users can manually adjust the width of each column on the fly by dragging the column dividers. 

By bypassing the fixed-width limitations of standard Salesforce templates, this component maximizes screen real estate and improves the productivity of service agents handling complex records.

## Features
* **Draggable Column Dividers:** Smooth, user-controlled resizing of three distinct regions.
* **Service Console Optimized:** Fits seamlessly within console workspace tabs and subtabs.
* **State Preservation:** Built with Aura controllers and renderers to ensure stable DOM manipulation during drag events.
* **Plug-and-Play:** Acts exactly like a standard Salesforce template in the Lightning App Builder.

---

## 🚀 Deployment Instructions

You can deploy this metadata to your Salesforce org using either the Salesforce CLI or Workbench.

### Method 1: Salesforce CLI (Recommended)
Assuming you have authenticated your org, run the following command from the root of this repository:
```bash
sfdx force:mdapi:deploy -d unpackaged/ -u <Your-Org-Alias> -w 10



🛠️ How to Use in the Service Console
Once deployed to your org, you must apply this template to your Service Console record pages via the Lightning App Builder so agents can interact with it.

Step 1: Create or Edit the Record Page
1. In your Salesforce org, navigate to Setup > Lightning App Builder.
2. Click New (or edit an existing Service Console record page).
3. Select Record Page and click Next.
4. Provide a Label (e.g., "Service Console Case Page") and select the target Object (e.g., Case), then click Next.
5. Under the Custom section in the template list, select Resizeable Three Column Record Template and click Finish.

Step 2: Configure the Layout
1. You will now see a blank layout with three distinct column regions in the App Builder canvas.
2. Drag and drop standard or custom Lightning components into the regions.
    a. Recommended Service Setup: Place Related Lists in the left column, Record Details in the center, and Chatter/Knowledge Base in the right column.
3. Click Save.

Step 3: Activate Specifically for the Service Console
To ensure this layout appears exclusively in your Service Console and doesn't disrupt standard app layouts:

1. Click Activation... in the top right corner of the Lightning App Builder.
2. Navigate to the App, Record Type, and Profile tab.
3. Click Assign to Apps, Record Types, and Profiles.
4. Select your Service Console app.
5. Select the relevant device factors (Desktop).
6. Select the applicable Record Types (e.g., Support Cases).
7. Select the applicable Profiles (e.g., Support Agents, System Administrator).
8. Review the assignments and click Save.

Step 4: Using the Resizable Feature in the UI
Once activated, service agents can open a record in the Service Console. To use the component:

1. Hover the mouse over the vertical gaps between the left/center and center/right columns.
2. The cursor will change to a horizontal resize icon.
3. Click and drag left or right to expand or shrink the columns in real-time, allowing agents to dedicate more screen space to the specific data they are actively reading (like a long case description or a detailed knowledge article).

💡 What I Have Built (Author's Note)
I built this solution to address a common pain point in standard Salesforce Lightning layouts: rigid, unchangeable column widths.

Standard templates restrict UI flexibility, which is highly problematic in a high-density Service Console environment where agents constantly need to shift focus between reading long case descriptions, looking at related lists, and referencing Knowledge articles.

Technical Breakdown of My Build:

Aura Component (.cmp): Acts as the foundational structural wrapper, defining the three aura:attribute regions (left, center, right) mapped out in the .design file so they appear as drop zones in the Lightning App Builder.

Custom Renderer (.js): Extends standard Aura rendering lifecycles to safely attach native DOM event listeners (mousedown, mousemove, mouseup) to the column dividers without violating Lightning Locker Service security protocols.

Controller & Helper (.js): Handles the mathematical logic of the drag events, calculating the exact mouse delta and dynamically applying new percentage-based or pixel-based widths to the column DOM elements in real-time.

Custom CSS (.css): Styles the dividers with specific cursor states (like col-resize) and hover effects, ensuring the UI clearly communicates to the user that the layout is interactive and resizable.

This repository represents a complete, deployable architectural enhancement for Salesforce Service UI.

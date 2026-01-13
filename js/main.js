
/**
 * Main JavaScript for Art by Beckman
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Art by Beckman loaded.');


});

/**
 * Tab Switching Logic
 * @param {Event} evt - The click event
 * @param {string} tabId - The ID of the tab content to show
 */
function openTab(evt, tabId) {
    // 1. Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // 2. Deactivate all tab buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show the selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }

    // 4. Activate the clicked button
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
}

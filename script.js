// Initial sample data
let tableData = [
  { id: 1, p7: '', p30: '', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '' },
  { id: 2, p7: '', p30: '', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '' },
  { id: 3, p7: '', p30: '', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '' },
  { id: 4, p7: '', p30: '', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '' },
  { id: 5, p7: '', p30: '', col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '' },
];

let nextId = 6;
let currentEditCell = null;

// DOM Elements
const tableBody = document.getElementById('tableBody');
const addRowBtn = document.getElementById('addRow');
const exportBtn = document.getElementById('exportData');
const toast = document.getElementById('toast');

// Initialize table
function init() {
  renderTable();
  setupEventListeners();
}

// Render all table rows
function renderTable() {
  tableBody.innerHTML = '';
  tableData.forEach((row, index) => {
    const tr = createTableRow(row, index);
    tableBody.appendChild(tr);
  });
}

// Create a single table row
function createTableRow(data, index) {
  const tr = document.createElement('tr');
  tr.dataset.id = data.id;
  tr.classList.add('row-enter');
  
  // Remove animation class after it completes
  setTimeout(() => tr.classList.remove('row-enter'), 300);
  
  tr.innerHTML = `
    <td class="col-id">${data.id}</td>
    <td class="col-data">
      <span class="cell-content" data-field="p7">${escapeHtml(data.p7)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="p30">${escapeHtml(data.p30)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col1">${escapeHtml(data.col1)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col2">${escapeHtml(data.col2)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col3">${escapeHtml(data.col3)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col4">${escapeHtml(data.col4)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col5">${escapeHtml(data.col5)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col6">${escapeHtml(data.col6)}</span>
    </td>
    <td class="col-data">
      <span class="cell-content" data-field="col7">${escapeHtml(data.col7)}</span>
    </td>
    <td class="col-actions">
      <button class="delete-btn" title="Delete row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </td>
  `;
  
  return tr;
}

// Setup event listeners
function setupEventListeners() {
  // Delegate click events for table cells
  tableBody.addEventListener('click', handleTableClick);
  
  // Add row button
  addRowBtn.addEventListener('click', addNewRow);
  
  // Export button
  exportBtn.addEventListener('click', exportData);
  
  // Global keyboard listener for escape
  document.addEventListener('keydown', handleGlobalKeydown);
}

// Handle clicks on table
function handleTableClick(e) {
  const cellContent = e.target.closest('.cell-content');
  const deleteBtn = e.target.closest('.delete-btn');
  
  if (deleteBtn) {
    const row = deleteBtn.closest('tr');
    deleteRow(row);
    return;
  }
  
  if (cellContent && !cellContent.querySelector('input') && !cellContent.querySelector('select')) {
    startEditing(cellContent);
  }
}

// Start editing a cell
function startEditing(cellContent) {
  // Cancel any existing edit
  if (currentEditCell && currentEditCell !== cellContent) {
    cancelEdit(currentEditCell);
  }
  
  const field = cellContent.dataset.field;
  const row = cellContent.closest('tr');
  const rowId = parseInt(row.dataset.id);
  const rowData = tableData.find(d => d.id === rowId);
  const currentValue = rowData[field];
  
  currentEditCell = cellContent;
  const td = cellContent.parentElement;
  td.classList.add('editing');
  
  // Create text input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'cell-input';
  input.value = currentValue;
  
  cellContent.innerHTML = '';
  cellContent.appendChild(input);
  input.focus();
  input.select();
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveEdit(cellContent, input.value);
    } else if (e.key === 'Escape') {
      cancelEdit(cellContent);
    }
  });
  
  input.addEventListener('blur', () => {
    // Small delay to check if we're clicking another cell
    setTimeout(() => {
      if (currentEditCell === cellContent) {
        saveEdit(cellContent, input.value);
      }
    }, 100);
  });
}

// Save the edited value
function saveEdit(cellContent, newValue) {
  if (!cellContent || !cellContent.parentElement) return;
  
  const field = cellContent.dataset.field;
  const row = cellContent.closest('tr');
  if (!row) return;
  
  const rowId = parseInt(row.dataset.id);
  const rowData = tableData.find(d => d.id === rowId);
  const td = cellContent.parentElement;
  
  // Update data
  const oldValue = rowData[field];
  rowData[field] = newValue.trim() || oldValue;
  
  // Update display
  td.classList.remove('editing');
  cellContent.textContent = rowData[field];
  
  currentEditCell = null;
  
  if (oldValue !== rowData[field]) {
    showToast('Cell updated successfully');
  }
}

// Cancel editing
function cancelEdit(cellContent) {
  if (!cellContent || !cellContent.parentElement) return;
  
  const field = cellContent.dataset.field;
  const row = cellContent.closest('tr');
  if (!row) return;
  
  const rowId = parseInt(row.dataset.id);
  const rowData = tableData.find(d => d.id === rowId);
  const td = cellContent.parentElement;
  
  td.classList.remove('editing');
  cellContent.textContent = rowData[field];
  currentEditCell = null;
}

// Add a new row
function addNewRow() {
  const newRow = {
    id: nextId++,
    p7: '',
    p30: '',
    col1: '',
    col2: '',
    col3: '',
    col4: '',
    col5: '',
    col6: '',
    col7: ''
  };
  
  tableData.push(newRow);
  const tr = createTableRow(newRow, tableData.length - 1);
  tableBody.appendChild(tr);
  
  showToast('New row added');
  
  // Scroll to the new row
  tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Auto-start editing the p7 field
  setTimeout(() => {
    const firstCell = tr.querySelector('[data-field="p7"]');
    if (firstCell) startEditing(firstCell);
  }, 350);
}

// Delete a row
function deleteRow(row) {
  const rowId = parseInt(row.dataset.id);
  
  row.classList.add('row-exit');
  
  setTimeout(() => {
    tableData = tableData.filter(d => d.id !== rowId);
    row.remove();
    showToast('Row deleted');
  }, 250);
}

// Export data as JSON
function exportData() {
  const dataStr = JSON.stringify(tableData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'table-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Data exported as JSON');
}

// Global keydown handler
function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && currentEditCell) {
    cancelEdit(currentEditCell);
  }
}

// Show toast notification
function showToast(message) {
  const toastMessage = toast.querySelector('.toast-message');
  toastMessage.textContent = message;
  toast.classList.add('visible');
  
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2500);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);


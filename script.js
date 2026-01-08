// Initial sample data
let tableData = [
  { id: 1, name: 'Alex Chen', email: 'alex.chen@example.com', role: 'Developer', status: 'active' },
  { id: 2, name: 'Sarah Miller', email: 'sarah.m@example.com', role: 'Designer', status: 'active' },
  { id: 3, name: 'James Wilson', email: 'j.wilson@example.com', role: 'Manager', status: 'pending' },
  { id: 4, name: 'Emma Davis', email: 'emma.d@example.com', role: 'Developer', status: 'active' },
  { id: 5, name: 'Michael Brown', email: 'm.brown@example.com', role: 'Analyst', status: 'inactive' },
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
    <td class="col-name">
      <span class="cell-content" data-field="name">${escapeHtml(data.name)}</span>
    </td>
    <td class="col-email">
      <span class="cell-content" data-field="email">${escapeHtml(data.email)}</span>
    </td>
    <td class="col-role">
      <span class="cell-content" data-field="role">${escapeHtml(data.role)}</span>
    </td>
    <td class="col-status">
      <span class="cell-content status-cell" data-field="status">
        <span class="status-badge status-${data.status}">${data.status}</span>
      </span>
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
  
  if (field === 'status') {
    // Create select dropdown for status
    const select = document.createElement('select');
    select.className = 'cell-input';
    select.innerHTML = `
      <option value="active" ${currentValue === 'active' ? 'selected' : ''}>Active</option>
      <option value="pending" ${currentValue === 'pending' ? 'selected' : ''}>Pending</option>
      <option value="inactive" ${currentValue === 'inactive' ? 'selected' : ''}>Inactive</option>
    `;
    
    cellContent.innerHTML = '';
    cellContent.appendChild(select);
    select.focus();
    
    select.addEventListener('change', () => saveEdit(cellContent, select.value));
    select.addEventListener('blur', () => setTimeout(() => saveEdit(cellContent, select.value), 100));
    select.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cancelEdit(cellContent);
      }
    });
  } else {
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
  
  if (field === 'status') {
    cellContent.innerHTML = `<span class="status-badge status-${rowData[field]}">${rowData[field]}</span>`;
  } else {
    cellContent.textContent = rowData[field];
  }
  
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
  
  if (field === 'status') {
    cellContent.innerHTML = `<span class="status-badge status-${rowData[field]}">${rowData[field]}</span>`;
  } else {
    cellContent.textContent = rowData[field];
  }
  
  currentEditCell = null;
}

// Add a new row
function addNewRow() {
  const newRow = {
    id: nextId++,
    name: 'New User',
    email: 'email@example.com',
    role: 'Role',
    status: 'pending'
  };
  
  tableData.push(newRow);
  const tr = createTableRow(newRow, tableData.length - 1);
  tableBody.appendChild(tr);
  
  showToast('New row added');
  
  // Scroll to the new row
  tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Auto-start editing the name field
  setTimeout(() => {
    const nameCell = tr.querySelector('[data-field="name"]');
    if (nameCell) startEditing(nameCell);
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


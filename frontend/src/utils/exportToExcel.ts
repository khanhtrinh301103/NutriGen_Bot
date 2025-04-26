import ExcelJS from 'exceljs';

export async function exportUsersToExcel(users: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'Age', key: 'age', width: 10 },
    { header: 'Goal', key: 'goal', width: 20 },
    { header: 'Activity', key: 'activity', width: 20 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Registered', key: 'registered', width: 20 },
    { header: 'Last Updated', key: 'updated', width: 20 },
  ];

  users.forEach((user) => {
    const hp = user.healthProfile || {};
    
    worksheet.addRow({
      name: user.name || '',
      email: user.email || '',
      status: user.status || 'active',
      gender: hp.gender || '',
      age: hp.age || '',
      goal: hp.goal || '',
      activity: hp.activityLevel || '',
      role: user.role || 'user',
      registered: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      updated: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '',
    });
  });

  // Áp dụng định dạng cho header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Đặt bộ lọc tự động
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 10 }
  };

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'users.xlsx';
  anchor.click();
  window.URL.revokeObjectURL(url);
}
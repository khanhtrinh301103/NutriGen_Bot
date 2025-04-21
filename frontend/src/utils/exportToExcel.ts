import ExcelJS from 'exceljs';

export async function exportUsersToExcel(users: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 25 },
    { header: 'Updated At', key: 'updatedAt', width: 25 },
  ];

  users.forEach((user) => {
    worksheet.addRow({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '',
    });
  });

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

package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.TransactionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    @Autowired
    private TransactionRepository transactionRepository;

    public ByteArrayInputStream exportTransactionsToExcel() {
        // 1. Lấy tất cả dữ liệu giao dịch
        List<Transaction> transactions = transactionRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("GiaoDich");

            // 2. Tạo dòng tiêu đề (Header)
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Khách hàng", "Số tiền (VNĐ)", "Điểm cộng", "Ngày giao dịch"};
            
            // Style cho tiêu đề (In đậm)
            CellStyle headerCellStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerCellStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // 3. Đổ dữ liệu vào các dòng
            int rowIdx = 1;
            for (Transaction trans : transactions) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(trans.getId());
                row.createCell(1).setCellValue(trans.getCustomer().getName()); // Tên khách
                row.createCell(2).setCellValue(trans.getTotalAmount());
                row.createCell(3).setCellValue(trans.getPointsEarned());
                row.createCell(4).setCellValue(trans.getTransactionDate().toString());
            }
            
            // Tự động giãn cột cho đẹp
            for(int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi tạo file Excel: " + e.getMessage());
        }
    }
}
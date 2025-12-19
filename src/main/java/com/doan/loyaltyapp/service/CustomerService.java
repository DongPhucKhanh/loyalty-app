package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // 1. Lấy danh sách tất cả khách hàng
    public List<Customer> getAllCustomers() {
        // Có thể sắp xếp người mới nhất lên đầu nếu muốn:
        // return customerRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return customerRepository.findAll();
    }

    // 2. Tìm khách hàng theo ID
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng có ID: " + id));
    }

    // 3. Thêm khách hàng mới
    public Customer createCustomer(Customer customer) {
        // Kiểm tra xem số điện thoại đã tồn tại chưa để tránh trùng lặp
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()) != null) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        // Thiết lập giá trị mặc định nếu thiếu
        if (customer.getPointBalance() == 0) customer.setPointBalance(0);
        if (customer.getTier() == null) customer.setTier("Mới");

        return customerRepository.save(customer);
    }

    // 4. Cập nhật thông tin khách hàng (Sửa)
    public Customer updateCustomer(Long id, Customer customerDetails) {
        // Tìm khách hàng trong DB trước
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại với ID: " + id));

        // Cập nhật thông tin mới (Chỉ sửa Tên, SĐT, Email)
        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());

        // Lưu ý: Chúng ta KHÔNG cập nhật điểm (pointBalance) ở đây. 
        // Điểm chỉ nên thay đổi qua giao dịch mua hàng hoặc đổi quà.
        
        return customerRepository.save(existingCustomer);
    }

    // 5. Xóa khách hàng
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Khách hàng không tồn tại để xóa!");
        }
        customerRepository.deleteById(id);
    }
}
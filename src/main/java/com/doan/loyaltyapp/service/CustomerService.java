package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    // 🔐 Inject PasswordEncoder (BCrypt)
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Lấy danh sách tất cả khách hàng
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // 2. Tìm khách hàng theo ID
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng có ID: " + id));
    }

    // 3. Thêm khách hàng mới (ĐÃ MÃ HÓA MẬT KHẨU)
    public Customer createCustomer(Customer customer) {

        // Kiểm tra trùng số điện thoại
        if (customer.getPhone() != null &&
                customerRepository.findByPhone(customer.getPhone()) != null) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }

        // 🔐 MÃ HÓA MẬT KHẨU
        if (customer.getPassword() != null && !customer.getPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        } else {
            throw new RuntimeException("Mật khẩu không được để trống!");
        }

        // Giá trị mặc định
        if (customer.getPointBalance() == 0) {
            customer.setPointBalance(0);
        }
        if (customer.getTier() == null) {
            customer.setTier("Mới");
        }

        return customerRepository.save(customer);
    }

    // 4. Cập nhật thông tin khách hàng (KHÔNG ĐỘNG TỚI PASSWORD)
    public Customer updateCustomer(Long id, Customer customerDetails) {

        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại với ID: " + id));

        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());

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

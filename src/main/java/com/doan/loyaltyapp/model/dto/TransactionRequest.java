package com.doan.loyaltyapp.model.dto;

import lombok.Data;

@Data
public class TransactionRequest {
    private Long customerId;
    private Double amount;
}

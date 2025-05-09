package com.wims.dto;

import com.wims.model.Log;

import java.util.List;

public class DashboardResponseDTO {
    private String warehouseName;
    private List<Log> logs;

    public DashboardResponseDTO(String warehouseName, List<Log> logs) {
        this.warehouseName = warehouseName;
        this.logs = logs;
    }

    public String getWarehouseName() {
        return warehouseName;
    }

    public List<Log> getLogs() {
        return logs;
    }
}

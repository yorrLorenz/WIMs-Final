package com.wims.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardLogDTO {
    private Long id;
    private LocalDateTime dateTime;
    private String username;
    private String action;
    private String item;
    private String warehouse;
    private String location;
    private String groupId;
    private Integer units;
    private Integer remainingUnits;
    private String previousLocation;
    private List<DashboardLogDTO> relatedLogs;

    public DashboardLogDTO(Long id,
                           LocalDateTime dateTime,
                           String username,
                           String action,
                           String item,
                           String warehouse,
                           String location,
                           String groupId,
                           Integer units,
                           Integer remainingUnits,
                           String previousLocation) {
        this.id = id;
        this.dateTime = dateTime;
        this.username = username;
        this.action = action;
        this.item = item;
        this.warehouse = warehouse;
        this.location = location;
        this.groupId = groupId;
        this.units = units;
        this.remainingUnits = remainingUnits;
        this.previousLocation = previousLocation;
    }

   
    public Long getId() { return id; }
    public LocalDateTime getDateTime() { return dateTime; }
    public String getUsername() { return username; }
    public String getAction() { return action; }
    public String getItem() { return item; }
    public String getWarehouse() { return warehouse; }
    public String getLocation() { return location; }
    public String getGroupId() { return groupId; }
    public Integer getUnits() { return units; }
    public Integer getRemainingUnits() { return remainingUnits; }
    public String getPreviousLocation() { return previousLocation; }
    public List<DashboardLogDTO> getRelatedLogs() { return relatedLogs; }

    public void setRelatedLogs(List<DashboardLogDTO> relatedLogs) {
        this.relatedLogs = relatedLogs;
    }
}

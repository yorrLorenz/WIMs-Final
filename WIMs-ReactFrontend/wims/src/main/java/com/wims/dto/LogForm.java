package com.wims.dto;

public class LogForm {
    private String action;
    private String item; // changed from itemName to item
    private String warehouseLocation;
    private String groupId;

    // Getters and Setters
    public String getAction() {
        return action;
    }
    public void setAction(String action) {
        this.action = action;
    }

    public String getItem() {
        return item;
    }
    public void setItem(String item) {
        this.item = item;
    }

    public String getWarehouseLocation() {
        return warehouseLocation;
    }
    public void setWarehouseLocation(String warehouseLocation) {
        this.warehouseLocation = warehouseLocation;
    }

    public String getGroupId() {
        return groupId;
    }
    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }
}

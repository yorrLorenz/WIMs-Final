package com.wims.model;

import jakarta.persistence.*;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupId;
    private String item;
    private String warehouse;
    private String currentLocation;
    private boolean active = true;
    private int units;

   

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getUnits() { return units; }
    public void setUnits(int units) { this.units = units; }

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }

    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }

    public String getWarehouse() { return warehouse; }
    public void setWarehouse(String warehouse) { this.warehouse = warehouse; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

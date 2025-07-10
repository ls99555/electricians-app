/**
 * Load and Demand Calculation Types
 */

import type { BaseCalculationResult } from './common';

// Load and demand calculation results
export interface MaximumDemandResult extends BaseCalculationResult {
  totalConnectedLoad: number;
  maximumDemand: number;
  diversityFactor: number;
  loadBreakdown: Array<{
    appliance: string;
    connectedLoad: number;
    demand: number;
    diversity: number;
  }>;
}

export interface DiversityFactorResult {
  lightingDemand: number;
  heatingDemand: number;
  socketDemand: number;
  cookerDemand: number;
  waterHeatingDemand: number;
  airConditioningDemand: number;
  motorDemand: number;
  totalDemand: number;
  diversityApplied: number;
  loadBreakdown: Array<{ 
    load: string; 
    connected: number; 
    demand: number; 
    diversity: number 
  }>;
}

// Load types
export interface LoadCharacteristics {
  loadTypes: Array<{
    type: 'resistive' | 'inductive' | 'capacitive' | 'non_linear' | 'motor' | 'lighting';
    percentage: number; // % of total load
    variability: 'constant' | 'varying' | 'intermittent';
  }>;
  totalLoad: number; // kW
  peakDemand: number; // kW
}

export interface LoadCalculatorInputs {
  // Simple load inputs (for basic calculations)
  lighting?: number; // W
  heating?: number; // W  
  cooking?: number; // W
  sockets?: number; // W
  otherLoads?: number; // W
  
  // Detailed appliance inputs (for advanced calculations)
  appliances: Array<{
    name: string;
    power: number; // W
    quantity: number;
    diversityFactor: number;
    category: 'lighting' | 'heating' | 'socket_outlet' | 'motor' | 'other';
  }>;
  installationType: InstallationType;
  operatingHours?: number;
  powerFactor?: number;
  efficiency?: number;
}

export type InstallationType = 'domestic' | 'commercial' | 'industrial' | 'agricultural' | 'healthcare' | 'educational' | 'retail';

// Advanced Load Demand Types
export interface LightingLoadInputs {
  rooms: Array<{
    name: string;
    roomType: LightingRoomType;
    area: number; // m²
    ceilingHeight: number; // m
    customLuxLevel?: number;
    utilizationFactor?: number;
    maintenanceFactor?: number;
    daylightFactor?: number;
    occupancyPattern?: string;
  }>;
  lightingType: LightingType;
  controlSystem: LightingControlSystem;
  installationType: InstallationType;
  diversityFactorOverride?: number;
  designStandards?: {
    illuminanceLevels: boolean; // Use CIBSE standards
    uniformityRatio: number;
    glareIndex: number;
  };
  energyEfficiency?: {
    targetEfficiency: number; // lm/W
    dimmingControl: boolean;
    occupancySensors: boolean;
    daylightLinking: boolean;
  };
}

export interface LightingLoadResult extends BaseCalculationResult {
  totalConnectedLoad: number; // W - Total connected lighting load
  totalDemandLoad: number; // W - Demand after diversity
  diversityFactor: number; // Applied diversity factor
  roomBreakdown: Array<{
    room: string;
    area: number; // m²
    luxLevel: number; // Required lux
    power: number; // W
    luminaires: number;
    powerDensity: number; // W/m²
    circuitProtection: number; // A
  }>;
  totalPowerDemand: number; // W - same as totalConnectedLoad for compatibility
  averagePowerDensity: number; // W/m²
  energyConsumption: number; // kWh/year
  numberOfLuminaires: number;
  complianceCheck: {
    illuminanceLevels: boolean;
    energyEfficiency: boolean;
    emergencyLighting: boolean;
  };
}

export type LightingRoomType = 'office' | 'classroom' | 'warehouse' | 'retail' | 'hospital' | 'residential' | 'industrial' | 'sports_hall' | 'corridor' | 'stairwell';
export type LightingType = 'led' | 'fluorescent' | 'halogen' | 'hid' | 'emergency' | 'decorative';
export type LightingControlSystem = 'manual' | 'occupancy_sensor' | 'daylight_linking' | 'time_control' | 'scene_control' | 'addressable';

export interface WaterHeatingLoadInputs {
  installationType: InstallationType;
  heatingMethod: WaterHeatingMethod;
  heaterDetails: Array<{
    type: WaterHeaterType;
    capacity: number; // litres
    power: number; // W
    quantity: number;
    simultaneousFactor?: number;
  }>;
  usage: WaterHeatingUsage;
  peakDemandTime: number; // hours
  recoveryTime: number; // hours
  diversityFactorOverride?: number;
  controlSystem?: string;
  insulation?: {
    cylinderInsulation: number; // mm
    pipeworkInsulation: number; // mm
  };
}

export interface WaterHeatingLoadResult extends BaseCalculationResult {
  totalConnectedLoad: number; // W - Total connected heating load
  totalDemandLoad: number; // W - Demand after diversity
  diversityFactor: number; // Applied diversity factor
  peakDemandCurrent: number; // A - Peak current demand
  heaterBreakdown: Array<{
    type: string;
    power: number; // W
    capacity: number; // litres
    simultaneousFactor: number;
    circuitProtection: number; // A
  }>;
  peakDemand: number; // kW
  dailyEnergyConsumption: number; // kWh
  annualEnergyConsumption: number; // kWh
  heatLosses: number; // kW
  efficiency: number; // %
  circuitRequirements: {
    supplyRating: number; // A
    cableSize: number; // mm²
    protectionDevice: string;
  };
  economicAnalysis: {
    runningCost: number; // £/year
    carbonEmissions: number; // kg CO2/year
  };
}

export type WaterHeatingMethod = 'immersion' | 'heat_pump' | 'solar_thermal' | 'gas_backup' | 'electric_boiler' | 'instantaneous';
export type WaterHeaterType = 'storage' | 'instantaneous' | 'combination' | 'heat_pump' | 'solar_assisted';
export type WaterHeatingUsage = 'domestic' | 'commercial' | 'industrial' | 'healthcare' | 'hospitality';

export interface SpaceHeatingLoadInputs {
  rooms: Array<{
    name: string;
    area: number; // m²
    volume: number; // m³
    roomType: SpaceHeatingRoomType;
    heatingMethod: SpaceHeatingMethod;
    power: number; // W
    thermostatControl: boolean;
    zoneControl: boolean;
    occupancySchedule: OccupancySchedule;
  }>;
  buildingType: BuildingType;
  controlSystem: HeatingControlSystem;
  installationType: InstallationType;
  simultaneityFactor?: number;
  diversityFactorOverride?: number;
  buildingData?: {
    buildingType: BuildingType;
    totalFloorArea: number; // m²
    heatedVolume: number; // m³
    insulation: {
      walls: string;
      roof: string;
      floor: string;
      windows: string;
    };
  };
  heatingSystem?: {
    method: SpaceHeatingMethod;
    controlSystem: HeatingControlSystem;
    efficiency: number; // %
    zoning: boolean;
  };
  operationalData?: {
    occupancySchedule: OccupancySchedule;
    setPointTemperature: number; // °C
    designTemperature: {
      internal: number; // °C
      external: number; // °C
    };
  };
}

export interface SpaceHeatingLoadResult extends BaseCalculationResult {
  totalConnectedLoad: number; // W - Total connected heating load
  totalDemandLoad: number; // W - Demand after diversity and simultaneity
  diversityFactor: number; // Applied diversity factor
  simultaneityFactor: number; // Applied simultaneity factor  
  peakDemandCurrent: number; // A - Peak current demand
  roomBreakdown: Array<{
    room: string;
    area: number; // m²
    power: number; // W
    heatingMethod: string;
    circuitProtection: number; // A
  }>;
  designHeatLoss: number; // kW
  peakDemand: number; // kW
  annualEnergyConsumption: number; // kWh
  roomByRoomBreakdown: Array<{
    room: string;
    area: number; // m²
    heatLoss: number; // kW
    heaterSize: number; // kW
  }>;
  systemSizing: {
    boilerCapacity: number; // kW
    pumpSize: number; // W
    expansionVessel: number; // litres
  };
  electricalLoad: {
    heatingElements: number; // kW
    pumps: number; // kW
    controls: number; // W
    totalLoad: number; // kW
  };
}

export type SpaceHeatingRoomType = 'office' | 'bedroom' | 'living_room' | 'kitchen' | 'bathroom' | 'corridor' | 'warehouse' | 'workshop';
export type SpaceHeatingMethod = 'electric_radiator' | 'storage_heater' | 'underfloor' | 'air_source_heat_pump' | 'ground_source_heat_pump' | 'electric_boiler';
export type HeatingControlSystem = 'manual' | 'programmable' | 'room_thermostat' | 'trv' | 'zone_control' | 'smart_control';
export type OccupancySchedule = 'residential' | 'office_hours' | 'retail' | 'industrial' | '24_hour' | 'educational';
export type BuildingType = 'domestic' | 'office' | 'retail' | 'industrial' | 'healthcare' | 'educational' | 'hospitality' | 'warehouse';

export interface AirConditioningLoadInputs {
  systems: Array<{
    name: string;
    type: AirConditioningType;
    coolingCapacity: number; // W
    heatingCapacity?: number; // W
    area: number; // m²
    roomType: AirConditioningRoomType;
    operatingHours: number;
    simultaneousFactor?: number;
  }>;
  buildingType: BuildingType;
  controlSystem: AirConditioningControlSystem;
  installationType: InstallationType;
  diversityFactorOverride?: number;
  coolingLoad?: {
    buildingType: BuildingType;
    floorArea: number; // m²
    ceiling_height: number; // m
    orientation: string;
    glazingRatio: number; // %
    insulation: string;
    occupancy: number; // people
    equipment: number; // W
    lighting: number; // W
  };
  systemType?: {
    type: AirConditioningType;
    efficiency: number; // COP or EER
    controlSystem: AirConditioningControlSystem;
    zoning: boolean;
  };
  operatingConditions?: {
    designTemperatures: {
      internal: number; // °C
      external: number; // °C
    };
    humidity: {
      internal: number; // %
      external: number; // %
    };
    operatingHours: number;
    partLoadProfile: number[];
  };
}

export interface AirConditioningLoadResult extends BaseCalculationResult {
  totalConnectedLoad: number; // W - Total connected AC load
  totalDemandLoad: number; // W - Demand after diversity
  diversityFactor: number; // Applied diversity factor
  systemBreakdown: Array<{
    name: string;
    type: string;
    power: number; // W
    area: number; // m²
    simultaneousFactor: number;
    circuitProtection: number; // A
  }>;
  coolingLoad: {
    sensible: number; // kW
    latent: number; // kW
    total: number; // kW
  };
  systemCapacity: {
    required: number; // kW
    recommended: number; // kW
    oversizingFactor: number;
  };
  electricalLoad: {
    compressor: number; // kW
    fans: number; // kW
    pumps: number; // kW
    controls: number; // W
    total: number; // kW
  };
  energyConsumption: {
    annual: number; // kWh
    peak: number; // kW
    partLoad: number[]; // hourly profile
  };
  roomByRoomAnalysis: Array<{
    room: string;
    area: number; // m²
    coolingLoad: number; // kW
    airflow: number; // l/s
    unitSize: number; // kW
  }>;
}

export type AirConditioningType = 'split_system' | 'multi_split' | 'vrv_vrf' | 'chilled_water' | 'dx_system' | 'evaporative' | 'heat_pump';
export type AirConditioningRoomType = 'office' | 'meeting_room' | 'server_room' | 'retail' | 'restaurant' | 'bedroom' | 'living_area';
export type AirConditioningControlSystem = 'manual' | 'thermostat' | 'programmable' | 'zone_control' | 'building_management' | 'smart_control';

export interface TotalInstallationLoadInputs {
  buildingDetails: {
    buildingType: InstallationType;
    floorArea: number; // m²
    occupancy: number; // people
    operatingHours: number;
  };
  loadCategories: {
    lighting: LightingLoadInputs;
    heating: SpaceHeatingLoadInputs;
    cooling: AirConditioningLoadInputs;
    waterHeating: WaterHeatingLoadInputs;
    socketOutlets: {
      generalSockets: number;
      dedicatedEquipment: Array<{
        name: string;
        power: number; // W
        quantity: number;
        diversity: number;
      }>;
    };
    specialLoads: Array<{
      description: string;
      power: number; // kW
      powerFactor: number;
      operatingHours: number;
    }>;
  };
  supplyDetails: {
    voltage: number; // V
    phases: number;
    frequency: number; // Hz
    earthingSystem: string;
  };
}

export interface TotalInstallationLoadResult extends BaseCalculationResult {
  loadSummary: {
    lighting: number; // kW
    heating: number; // kW
    cooling: number; // kW
    waterHeating: number; // kW
    socketOutlets: number; // kW
    specialLoads: number; // kW
    total: number; // kW
  };
  diversityAnalysis: {
    connectedLoad: number; // kW
    afterDiversityMaximumDemand: number; // kW
    diversityFactor: number;
    loadFactor: number;
  };
  supplyRequirements: {
    mainSupplyCapacity: number; // kVA
    mainSwitchRating: number; // A
    mainEarthingConductor: number; // mm²
    submainDistribution: Array<{
      description: string;
      capacity: number; // A
      cableSize: number; // mm²
      protection: string;
    }>;
  };
  circuitSchedule: Array<{
    circuitDescription: string;
    load: number; // kW
    current: number; // A
    cableSize: number; // mm²
    protection: number; // A
    length: number; // m
  }>;
  complianceChecks: {
    voltageDrop: boolean;
    discrimination: boolean;
    earthFaultLoop: boolean;
    rcdProtection: boolean;
  };
}

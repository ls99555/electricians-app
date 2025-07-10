/**
 * BS 7671 Regulation References
 * 18th Edition Requirements for Electrical Installations
 * SparkyTools - UK Electrical Regulations Compliant
 */

// Regulation sections and their descriptions
export const BS7671_SECTIONS = {
  // Part 1 - Scope, object and fundamental principles
  100: 'Scope, object and fundamental principles',
  110: 'General',
  120: 'Scope',
  130: 'Fundamental principles',
  131: 'Protection for safety',
  132: 'Design',
  133: 'Selection and erection of equipment',
  134: 'Verification',
  135: 'Maintenance',

  // Part 4 - Protection for safety
  411: 'Protective measure: Automatic disconnection of supply',
  412: 'Protective measure: Double or reinforced insulation',
  413: 'Protective measure: Electrical separation',
  414: 'Protective measure: Extra-low voltage (SELV, PELV and FELV)',
  415: 'Additional protection',
  416: 'Provisions for basic protection',
  417: 'Obstacles and placing out of reach',
  418: 'Protective measures for application only where the installation is controlled or under supervision of skilled or instructed persons',

  421: 'General requirements for protection against thermal effects',
  422: 'Protection against fire caused by electrical equipment',
  423: 'Protection against burns',

  430: 'General requirements for protection against overcurrent',
  431: 'Protection against overload current',
  432: 'Protection against fault current',
  433: 'Protection against overload current and fault current',
  434: 'Protection of conductors in parallel',
  435: 'Co-ordination of overload current and fault current protection',
  436: 'Limitation of overcurrent by characteristics of supply',

  443: 'Protection against overvoltage of atmospheric origin or due to switching',
  444: 'Measures against electromagnetic influences',

  // Part 5 - Selection and erection of equipment
  511: 'Common rules',
  512: 'Operational conditions and external influences',
  513: 'Accessibility',
  514: 'Identification and notices',
  515: 'Prevention of mutual detrimental influence',
  516: 'Electrical connections',

  521: 'General requirements for the selection and erection of wiring systems',
  522: 'Selection and erection of wiring systems in relation to external influences',
  523: 'Current-carrying capacity of conductors',
  524: 'Cross-sectional areas of conductors',
  525: 'Voltage drop in consumers\' installations',
  526: 'Electrical connections',
  527: 'Selection and erection of wiring systems to minimise the spread of fire',
  528: 'Proximity of wiring systems to other services',
  529: 'Selection and erection of wiring systems in relation to maintainability, including cleaning',

  530: 'General',
  531: 'Devices for protection against electric shock',
  532: 'Devices for protection against thermal effects',
  533: 'Devices for protection against overcurrent',
  534: 'Devices for protection against overvoltage',
  535: 'Devices for isolation and switching',
  536: 'Co-ordination of protective devices',
  537: 'Devices for isolation and switching',

  540: 'General',
  541: 'General requirements for protective earthing arrangements',
  542: 'Arrangements for protective conductors',
  543: 'Protective bonding conductors',
  544: 'Arrangements for protective earthing of installations',

  551: 'General',
  552: 'Rotating machines',
  553: 'Accessories',
  554: 'Current-using equipment',
  555: 'Transformers',
  556: 'Safety services',
  557: 'Auxiliary circuits',
  559: 'Luminaires and lighting installations',

  // Part 6 - Inspection and testing
  610: 'General',
  611: 'Initial verification',
  612: 'Testing',
  621: 'Initial inspection',
  622: 'Initial testing',
  631: 'Periodic inspection',
  632: 'Periodic testing',
  633: 'Model forms for certification and reporting',

  // Part 7 - Special installations or locations
  701: 'Locations containing a bath or shower',
  702: 'Swimming pools and other basins',
  703: 'Rooms and cabins containing sauna heaters',
  704: 'Construction and demolition site installations',
  705: 'Agricultural and horticultural premises',
  706: 'Conducting locations with restricted movement',
  708: 'Caravan parks, camping parks and similar locations',
  709: 'Marinas and similar locations',
  711: 'Exhibitions, shows and stands',
  712: 'Solar photovoltaic (PV) power supply systems',
  714: 'Outdoor lighting installations',
  715: 'Extra-low voltage lighting installations',
  717: 'Mobile or transportable units',
  718: 'Public premises',
  721: 'Electrical installations in caravans and motor caravans',
  722: 'Electric vehicle charging installations',
  729: 'Operating and maintenance gangways',
  730: 'Onshore units of electrical shore connections for inland navigation vessels',
  740: 'Temporary electrical installations for structures, amusement devices and booths at fairgrounds, amusement parks and circuses',
  753: 'Floor and ceiling heating systems'
} as const;

// Maximum Zs values for different protective devices
export const MAX_ZS_VALUES = {
  // BS 7671 Table 41.3 - Maximum Zs values for fuses to BS 88-3
  fuses_bs88: {
    6: 7.67,    // 6A
    10: 4.60,   // 10A
    16: 2.87,   // 16A
    20: 2.30,   // 20A
    25: 1.84,   // 25A
    32: 1.44,   // 32A
    40: 1.15,   // 40A
    50: 0.92,   // 50A
    63: 0.73,   // 63A
    80: 0.58,   // 80A
    100: 0.46   // 100A
  },

  // BS 7671 Table 41.4 - Maximum Zs values for MCBs to BS EN 60898
  mcb_type_b: {
    6: 7.67,    // B6
    10: 4.60,   // B10
    16: 2.87,   // B16
    20: 2.30,   // B20
    25: 1.84,   // B25
    32: 1.44,   // B32
    40: 1.15,   // B40
    50: 0.92,   // B50
    63: 0.73    // B63
  },

  mcb_type_c: {
    6: 3.83,    // C6
    10: 2.30,   // C10
    16: 1.44,   // C16
    20: 1.15,   // C20
    25: 0.92,   // C25
    32: 0.72,   // C32
    40: 0.58,   // C40
    50: 0.46,   // C50
    63: 0.37    // C63
  },

  mcb_type_d: {
    6: 1.92,    // D6
    10: 1.15,   // D10
    16: 0.72,   // D16
    20: 0.58,   // D20
    25: 0.46,   // D25
    32: 0.36,   // D32
    40: 0.29,   // D40
    50: 0.23,   // D50
    63: 0.18    // D63
  }
} as const;

// Voltage drop limits from BS 7671 Section 525
export const VOLTAGE_DROP_LIMITS = {
  lighting: 3.0,      // 3% for lighting circuits
  other_uses: 5.0     // 5% for other uses
} as const;

// Disconnection times from BS 7671 Table 41.1
export const DISCONNECTION_TIMES = {
  tn_system: {
    final_circuits: 0.4,  // 0.4s for final circuits
    distribution: 5.0     // 5s for distribution circuits
  },
  tt_system: {
    final_circuits: 0.2,  // 0.2s for final circuits
    distribution: 1.0     // 1s for distribution circuits
  }
} as const;

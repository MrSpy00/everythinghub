/**
 * aegisFlasher Core Type Definitions
 * EverythingHub Universal Hardware Flasher & Terminal Engine
 */

export type ChipFamily =
  | "ESP32"
  | "ESP32-S2"
  | "ESP32-S3"
  | "ESP32-C2"
  | "ESP32-C3"
  | "ESP32-C6"
  | "ESP32-H2"
  | "ESP32-P4"
  | "ESP8266"
  | "AVR-ATmega328P"
  | "AVR-ATmega2560"
  | "AVR-ATmega32U4"
  | "RP2040"
  | "STM32F103"
  | "STM32F407"
  | "Generic-Serial";

export type MicrocontrollerCategory =
  | "all"
  | "smart-home"
  | "security-mesh"
  | "iot-automation"
  | "cnc-robotics"
  | "solar-energy"
  | "python-lua"
  | "diagnostics";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "syncing"
  | "flashing"
  | "erasing"
  | "reading"
  | "terminal"
  | "error";

export interface ChipTelemetry {
  family: ChipFamily;
  modelName: string;
  revision?: string;
  macAddress?: string;
  chipId?: string;
  flashSize?: string;
  flashSizeInBytes?: number;
  flashFrequency?: string;
  flashMode?: "QIO" | "QOUT" | "DIO" | "DOUT";
  crystalFreq?: string;
  features: string[];
  bootloaderVersion?: string;
  detectedAt?: Date;
}

export interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

export interface FlashPartitionFile {
  id: string;
  name: string;
  offset: number; // e.g. 0x1000
  offsetHex: string; // "0x1000"
  data: Uint8Array | null;
  sizeBytes: number;
  sourceType: "file" | "url" | "nvs" | "preset";
  status: "idle" | "ready" | "flashing" | "verified" | "error";
  progressPercent: number;
  md5Checksum?: string;
  errorMessage?: string;
}

export interface FirmwareManifestBuildPart {
  path: string;
  offset: number | string; // e.g. 0x0 or "0x10000"
  name?: string;
}

export interface FirmwareManifestBuild {
  chip: ChipFamily | string;
  chipFamilyAlias?: string[];
  version: string;
  releaseDate?: string;
  description?: string;
  minFlashSize?: string;
  parts: FirmwareManifestBuildPart[];
}

export interface FirmwareProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  category: MicrocontrollerCategory;
  supportedChips: ChipFamily[];
  stars?: string;
  badge?: string;
  author: string;
  websiteUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
  license: string;
  latestVersion: string;
  availableVersions: string[];
  builds: Record<string, FirmwareManifestBuild[]>; // key: version string
  recommendedBaud?: number;
  eraseBeforeFlash?: boolean;
}

export interface PartitionTableEntry {
  id: string;
  name: string;
  type: "app" | "data";
  subType: "factory" | "ota_0" | "ota_1" | "nvs" | "otadata" | "spiffs" | "littlefs" | "coredump" | "phy" | "custom";
  offset: number;
  size: number;
  flags: string;
  color: string;
}

export interface SerialLogMessage {
  id: string;
  timestamp: string;
  direction: "rx" | "tx" | "sys" | "err" | "warn" | "success";
  text: string;
  rawBytes?: Uint8Array;
}

export interface UsbDriverInfo {
  id: string;
  name: string;
  chipsets: string;
  vendorIds: string[];
  supportedOS: ("windows" | "mac" | "linux")[];
  description: string;
  downloadUrlWin?: string;
  downloadUrlMac?: string;
  downloadUrlLinux?: string;
  notes: string;
}

export interface PinoutPin {
  pinNumber: number | string;
  label: string;
  physicalPosition: "left" | "right" | "top" | "bottom";
  functions: string[];
  color: "power" | "ground" | "gpio" | "analog" | "comm" | "strapping" | "touch" | "dac";
  description?: string;
  isStrappingPin?: boolean;
  strappingNote?: string;
}

export interface BoardPinoutProfile {
  id: string;
  name: string;
  chip: ChipFamily;
  formFactor: string;
  imageOrDiagram?: string;
  dimensions: string;
  operatingVoltage: string;
  inputVoltage: string;
  totalGpios: number;
  adcPins: number;
  dacPins?: number;
  interfaces: string[];
  strappingInstructions: string[];
  pins: PinoutPin[];
}

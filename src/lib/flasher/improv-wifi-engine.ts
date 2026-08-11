/**
 * Improv-Wi-Fi Serial Protocol Engine
 * Standardized serial RPC protocol used by ESPHome, WLED, Tasmota, and Home Assistant.
 * Protocol Spec: https://www.improv-wifi.com/serial/
 */

export enum ImprovCommand {
  SEND_WIFI_SETTINGS = 0x01,
  IDENTIFY = 0x02,
  REQUEST_DEVICE_INFO = 0x03,
  REQUEST_SCANNED_WIFI_NETWORKS = 0x04,
}

export enum ImprovState {
  STOPPED = 0x00,
  AWAITING_AUTHORIZATION = 0x01,
  AUTHORIZED = 0x02,
  PROVISIONING = 0x03,
  PROVISIONED = 0x04,
}

export enum ImprovError {
  NO_ERROR = 0x00,
  INVALID_RPC = 0x01,
  UNKNOWN_RPC = 0x02,
  UNABLE_TO_CONNECT = 0x03,
  NOT_AUTHORIZED = 0x04,
  UNKNOWN_ERROR = 0xff,
}

export interface ImprovScannedNetwork {
  ssid: string;
  rssi: number;
  authMode: string;
}

export interface ImprovDeviceInfo {
  firmwareName?: string;
  firmwareVersion?: string;
  hardwareChip?: string;
  deviceName?: string;
  redirectUrl?: string;
  ipAddress?: string;
}

export class ImprovWifiEngine {
  private static HEADER = new Uint8Array([0x49, 0x4d, 0x50, 0x52, 0x4f, 0x56]); // "IMPROV"

  /**
   * Build packet with checksum
   */
  public static buildPacket(type: number, data: Uint8Array): Uint8Array {
    const packet = new Uint8Array(6 + 1 + 1 + data.length + 1);
    packet.set(this.HEADER, 0);
    packet[6] = 0x01; // Protocol version 1
    packet[7] = type; // Packet type (0x03 for command)
    packet.set(data, 8);

    // Calculate checksum: sum of all bytes modulo 256
    let sum = 0;
    for (let i = 0; i < packet.length - 1; i++) {
      sum += packet[i];
    }
    packet[packet.length - 1] = sum & 0xff;

    return packet;
  }

  /**
   * Generate Packet to scan Wi-Fi networks (Command 0x04)
   */
  public static createScanNetworksPacket(): Uint8Array {
    return this.buildPacket(0x03, new Uint8Array([ImprovCommand.REQUEST_SCANNED_WIFI_NETWORKS, 0x00]));
  }

  /**
   * Generate Packet to request device information (Command 0x03)
   */
  public static createRequestDeviceInfoPacket(): Uint8Array {
    return this.buildPacket(0x03, new Uint8Array([ImprovCommand.REQUEST_DEVICE_INFO, 0x00]));
  }

  /**
   * Generate Packet to send Wi-Fi SSID & Password (Command 0x01)
   */
  public static createSendWifiPacket(ssid: string, password: string): Uint8Array {
    const encoder = new TextEncoder();
    const ssidBytes = encoder.encode(ssid);
    const passBytes = encoder.encode(password);

    // Payload: [Command, DataLength, SSID_Len, ...SSID, Pass_Len, ...Password]
    const dataLen = 1 + ssidBytes.length + 1 + passBytes.length;
    const payload = new Uint8Array(1 + 1 + dataLen);

    payload[0] = ImprovCommand.SEND_WIFI_SETTINGS;
    payload[1] = dataLen;
    payload[2] = ssidBytes.length;
    payload.set(ssidBytes, 3);
    payload[3 + ssidBytes.length] = passBytes.length;
    payload.set(passBytes, 4 + ssidBytes.length);

    return this.buildPacket(0x03, payload);
  }

  /**
   * Parse incoming Improv frame from serial buffer
   */
  public static parseFrame(bytes: Uint8Array): {
    type: "state" | "error" | "rpc_result" | "unknown";
    state?: ImprovState;
    error?: ImprovError;
    rpcResultData?: string[];
  } | null {
    // Look for "IMPROV" header
    let headerIdx = -1;
    for (let i = 0; i <= bytes.length - 6; i++) {
      if (
        bytes[i] === 0x49 &&
        bytes[i + 1] === 0x4d &&
        bytes[i + 2] === 0x50 &&
        bytes[i + 3] === 0x52 &&
        bytes[i + 4] === 0x4f &&
        bytes[i + 5] === 0x56
      ) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1 || headerIdx + 8 >= bytes.length) return null;

    const type = bytes[headerIdx + 7];
    const dataLen = bytes[headerIdx + 8] || 0;
    const dataStart = headerIdx + 9;
    const dataEnd = dataStart + dataLen;

    if (type === 0x01) {
      // State packet
      const stateVal = bytes[dataStart] as ImprovState;
      return { type: "state", state: stateVal };
    }

    if (type === 0x02) {
      // Error packet
      const errVal = bytes[dataStart] as ImprovError;
      return { type: "error", error: errVal };
    }

    if (type === 0x04) {
      // RPC Result packet
      const strings: string[] = [];
      let cursor = dataStart;
      while (cursor < dataEnd) {
        const len = bytes[cursor];
        cursor++;
        if (cursor + len <= dataEnd) {
          const str = new TextDecoder().decode(bytes.slice(cursor, cursor + len));
          strings.push(str);
          cursor += len;
        } else {
          break;
        }
      }
      return { type: "rpc_result", rpcResultData: strings };
    }

    return null;
  }
}

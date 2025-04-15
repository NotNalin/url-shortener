import { UAParser } from "ua-parser-js";

export interface UserAgentData {
  browser: {
    name: string;
    version: string;
    major: string;
    type: string;
  };
  cpu: {
    architecture: string;
  };
  device: {
    vendor: string;
    model: string;
    type: string;
  };
  engine: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
}

/**
 * Parse user agent string to extract detailed browser, OS, and device information
 * Uses ua-parser-js library for reliable detection
 * @param userAgent - The user agent string from the request
 * @returns Object containing detailed browser, operating system, and device information
 */
export function parseUserAgent(userAgent: string): UserAgentData {
  // Skip processing for empty user agent
  if (!userAgent) {
    return {
      browser: {
        name: "Unknown",
        version: "",
        major: "",
        type: "",
      },
      cpu: {
        architecture: "",
      },
      device: {
        vendor: "",
        model: "",
        type: "Desktop",
      },
      engine: {
        name: "",
        version: "",
      },
      os: {
        name: "Unknown",
        version: "",
      },
    };
  }

  // Initialize parser
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Map the parser results to our interface
  return {
    browser: {
      name: result.browser.name || "Unknown",
      version: result.browser.version || "",
      major: result.browser.major || "",
      type: result.browser.type || "",
    },
    cpu: {
      architecture: result.cpu.architecture || "",
    },
    device: {
      vendor: result.device.vendor || "",
      model: result.device.model || "",
      type: result.device.type || "Desktop",
    },
    engine: {
      name: result.engine.name || "",
      version: result.engine.version || "",
    },
    os: {
      name: result.os.name || "Unknown",
      version: result.os.version || "",
    },
  };
}

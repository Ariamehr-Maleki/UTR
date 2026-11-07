import "server-only";
import net from "node:net";
// Optional private ClamAV INSTREAM service. Failure/timeout never means clean.
export async function scanPdf(bytes: Buffer) {
  const host = process.env.UTR_CLAMAV_HOST;
  const port = Number(process.env.UTR_CLAMAV_PORT || 3310);
  if (!host) throw Error("PDF scanner unavailable");
  return new Promise<void>((resolve, reject) => {
    let response = "";
    const socket = net.createConnection({ host, port });
    socket.setTimeout(20000);
    socket.on("connect", () => {
      socket.write(Buffer.from("zINSTREAM\0"));
      for (let offset = 0; offset < bytes.length; offset += 65536) {
        const chunk = bytes.subarray(offset, offset + 65536);
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
    socket.on("data", (d) => {
      response += d.toString("utf8");
      if (response.includes("\0")) {
        socket.destroy();
        response.replace(/\0/g, "").trim() === "stream: OK"
          ? resolve()
          : reject(Error("PDF safety scan rejected"));
      }
    });
    socket.on("timeout", () => socket.destroy(Error("PDF scanner timeout")));
    socket.on("error", reject);
    socket.on("end", () => {
      if (!response.includes("\0"))
        reject(Error("Incomplete scanner response"));
    });
  });
}

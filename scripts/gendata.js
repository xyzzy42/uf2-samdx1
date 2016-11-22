let fs = require("fs")
let buf = fs.readFileSync(process.argv[2])
let tail = new Buffer(8192 - buf.length)
tail.fill(0)
buf = Buffer.concat([buf, tail]) // pad with zeros

function addCrc(ptr, crc) {
  crc = crc ^ ptr << 8;
  for (var cmpt = 0; cmpt < 8; cmpt++) {
    if (crc & 0x8000)
      crc = crc << 1 ^ 0x1021;
    else
      crc = crc << 1;
    crc &= 0xffff;
  }
  return crc
}

let size = buf.length
let s = "#include <stdint.h>\n"
s += "const uint8_t bootloader[" + size + "] __attribute__ ((aligned (4))) = {"
function tohex(v) {
  return "0x" + ("00" + v.toString(16)).slice(-2) + ", "
}
let crc = 0
let crcs = ""
for (let i = 0; i < size; ++i) {
  if (i % 16 == 0) {
    s += "\n"
  }
  s += tohex(buf[i])
  crc = addCrc(buf[i], crc)
  if (i % 1024 == 1023) {
    crcs += crc + ", "
    crc = 0
  }
}
s += "\n};\n"
s += "const uint16_t bootloader_crcs[] = {" + crcs + "};"
console.log(s)
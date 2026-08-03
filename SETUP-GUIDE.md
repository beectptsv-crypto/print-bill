# ຄູ່ມືຕິດຕັ້ງ Print Bridge ຢູ່ Laptop ໜ່ວຍໃໝ່

ໃຊ້ຄູ່ມືນີ້ເມື່ອຕ້ອງການພິມບິນຜ່ານ Xprinter ຈາກ laptop ອື່ນທີ່ບໍ່ແມ່ນເຄື່ອງເດີມ.

## 1. ເປີດ web app (ບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງ)

ເປີດ link ນີ້ໃນ browser (Chrome ຫຼື Edge ແນະນຳ):
```
https://beectptsv-crypto.github.io/print-bill/
```

## 2. ຕິດຕັ້ງ Python

1. ໄປ https://www.python.org/downloads/
2. ດາວໂຫຼດ ແລະ ຕິດຕັ້ງ Python ຮຸ່ນລ່າສຸດ
3. **ສຳຄັນ:** ຕອນຕິດຕັ້ງ ໃຫ້ຕິກຊ່ອງ **"Add python.exe to PATH"** ກ່ອນກົດ Install

## 3. ຕິດຕັ້ງ pywin32

ເປີດ Terminal (Command Prompt ຫຼື PowerShell) ແລ້ວແລ່ນ:
```bash
pip install pywin32
```

## 4. ດາວໂຫຼດ print_bridge.py

ເປີດ link ນີ້ໃນ browser ແລ້ວບັນທຶກໄຟລ໌ (Ctrl+S ຫຼື Save As) ໄປໄວ້ໃນໂຟນເດີ້ໃດໜຶ່ງທີ່ຈື່ໄດ້ ເຊັ່ນ Desktop:
```
https://raw.githubusercontent.com/beectptsv-crypto/print-bill/main/print_bridge.py
```

## 5. ຕໍ່ Xprinter ເຂົ້າກັບ laptop ນີ້ ດ້ວຍສາຍ USB

ຄາດວ່າ Windows ອາດ **ບໍ່ຮູ້ຈັກເຄື່ອງພິມທັນທີ** (ຄືກັນກັບເຄື່ອງທຳອິດ) ເພາະ driver ຕ້ອງຕິດຕັ້ງແຍກຕ່າງຫາກສຳລັບແຕ່ລະເຄື່ອງຄອມ. ຖ້າເປັນແບບນີ້:

1. ເປີດ **Device Manager** (ຄລິກຂວາໃສ່ Start → Device Manager)
2. ຫາອຸປະກອນທີ່ຊື່ຄ້າຍ "USB Printer Port" ຫຼື ມີເຄື່ອງໝາຍ ⚠️ ເຕືອນ
3. ຖ້າພົບ ແລະ driver ຜິດ (Class = "libusbk devices" ຫຼື ຄ້າຍກັນ), ໃຫ້ແກ້ດັ່ງນີ້:
   - ເປີດ PowerShell ແບບ **Administrator** (ຄລິກຂວາ → Run as administrator)
   - ເບິ່ງຊື່ driver package (ຄລິກຂວາໃສ່ອຸປະກອນໃນ Device Manager → Properties → tab Driver → Driver Details, ຫຼືຖາມຂ້ອຍໃນ session ໃໝ່ ຖ້າມີບັນຫາ)
   - ແລ່ນ: `pnputil /delete-driver <ຊື່ໄຟລ໌ .inf> /uninstall /force`
   - ຖອດ/ສຽບສາຍ USB ຄືນ
   - ໄປ Settings → Printers & scanners ເບິ່ງວ່າຂຶ້ນເປັນເຄື່ອງພິມແທ້ບໍ່

ຖ້າຕິດຂັດຂັ້ນຕອນນີ້, ເປີດ session ໃໝ່ກັບ Claude ຢູ່ laptop ນັ້ນ (ຕ້ອງມີ Claude Code ຕິດຕັ້ງຢູ່ເຄື່ອງນັ້ນ) ແລ້ວອະທິບາຍບັນຫາ, ຫຼືສົ່ງຮູບ Device Manager ມາຖາມໃນແຊັດນີ້ກໍ່ໄດ້ (ຂ້ອຍຈະຊ່ວຍວິເຄາະຈາກຮູບ, ພຽງແຕ່ຕ້ອງແລ່ນຄຳສັ່ງດ້ວຍຕົນເອງ ເພາະຂ້ອຍເຂົ້າເຖິງແຕ່ເຄື່ອງທຳອິດເທົ່ານັ້ນ).

## 6. ແລ່ນ print_bridge.py

ໄປໂຟນເດີ້ທີ່ບັນທຶກໄຟລ໌ໄວ້, ຄລິກຂວາ → Open in Terminal, ແລ່ນ:
```bash
python print_bridge.py
```
ຄ້າງໜ້າຕ່າງນີ້ໄວ້ ຢ່າປິດ.

## 7. ໃຊ້ງານຈາກ web app

1. ກັບໄປ web app (`https://beectptsv-crypto.github.io/print-bill/`)
2. ເລື່ອນລົງໄປຫາ "🖨️ Print Bridge"
3. ກົດ "🔄 ດຶງລາຍຊື່ເຄື່ອງພິມ"
4. ເລືອກເຄື່ອງພິມທີ່ຂຶ້ນມາ
5. ພິມທົດສອບໄດ້ເລີຍ

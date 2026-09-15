//% color="#D83B01" icon="\uf025" block="DFPlayer Avanzado"
namespace dfplayerAvanzado {
    let alTerminarHandler: () => void;
    let totalPistas = 0;

    //% block="inicializar DFPlayer en RX %rx TX %tx"
    //% rx.defl=SerialPin.P0 tx.defl=SerialPin.P1
    export function conectar(rx: SerialPin, tx: SerialPin): void {
        serial.redirect(rx, tx, BaudRate.BaudRate9600);

        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            let buf = serial.readBuffer(10);
            let cmd = buf.getNumber(NumberFormat.UInt8LE, 3);

            if (cmd == 0x4E) {
                totalPistas = buf.getNumber(NumberFormat.UInt8LE, 6);
            } else if (cmd == 0x3D) {
                if (alTerminarHandler) {
                    alTerminarHandler();
                }
            }
        });
    }

    //% block="al terminar canción"
    export function alTerminarCancion(handler: () => void) {
        alTerminarHandler = handler;
    }

    //% block="pedir total de canciones de la carpeta %carpeta"
    export function consultarTotalPistas(carpeta: number): void {
        let buf = pins.createBuffer(8);
        buf.setNumber(NumberFormat.UInt8LE, 0, 0x7E);
        buf.setNumber(NumberFormat.UInt8LE, 1, 0xFF);
        buf.setNumber(NumberFormat.UInt8LE, 2, 0x06);
        buf.setNumber(NumberFormat.UInt8LE, 3, 0x4E);
        buf.setNumber(NumberFormat.UInt8LE, 4, 0x00);
        buf.setNumber(NumberFormat.UInt8LE, 5, 0x00);
        buf.setNumber(NumberFormat.UInt8LE, 6, carpeta);
        buf.setNumber(NumberFormat.UInt8LE, 7, 0xEF);
        serial.writeBuffer(buf);
    }

    //% block="total de canciones detectadas"
    export function obtenerTotalPistas(): number {
        return totalPistas;
    }
}
//% color="#D83B01" icon="\uf025" block="DFPlayer Avanzado"
namespace dfplayerAvanzado {
    let alTerminarHandler: () => void;
    let totalPistas = 0;

    /**
     * Inicializa la comunicación por puerto serie con el DFPlayer Mini
     */
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

    /**
     * Se ejecuta automáticamente cuando termina de sonar una canción
     */
    //% block="al terminar canción"
    //% handlerStatement=1
    export function alTerminarCancion(handler: () => void) {
        alTerminarHandler = handler;
    }

    /**
     * Consulta al DFPlayer el número total de canciones en una carpeta
     */
    //% block="pedir total de canciones de la carpeta %carpeta"
    //% carpeta.defl=1
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

    /**
     * Devuelve el total de canciones detectadas tras la consulta
     */
    //% block="total de canciones detectadas"
    export function obtenerTotalPistas(): number {
        return totalPistas;
    }
}

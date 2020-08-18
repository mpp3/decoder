const cellWidth = 220;
const cellHeight = 50;
const varHeight = 60;
const varWidth = 460;
const closeButtonWidth = cellHeight;
const memsize = 15;

function binaryToInt(binary) {

}

function binaryToFloat(binary) {
    if (binary.length < 32) {
        console.log(`Not enough bits for a double: ${binary}`)
        return "ERROR";
    }
    else {
        let sign = (binary[0] == "0") ? 1 : -1;
        let expBits = binary.substring(1, 9);
        let manBits = binary.substring(9, 32);
        console.log(`expb: ${expBits} manb: ${manBits}`);
        let mantisa = 1;
        for (let i = 0; i < 23; i++) {
            mantisa += parseInt(manBits[i]) * Math.pow(2, -(i + 1));
        }
        let exponent = 0;
        for (let i = 0; i < 8; i++) {
            exponent += parseInt(expBits[i]) * Math.pow(2, 7 - i);
        }
        let expAdjusted = exponent - 127
        let result = sign * mantisa * Math.pow(2, expAdjusted);
        console.log(`sign: ${sign} exp: ${expAdjusted} mant: ${mantisa}`);
        return result.toPrecision(4).toString();
    }
}

function binaryToDouble(binary) {
    if (binary.length < 64) {
        console.log(`Not enough bits for a double: ${binary}`)
        return "ERROR";
    }
    else {
        let sign = (binary[0] == "0") ? 1 : -1;
        let expBits = binary.substring(1, 12);
        let manBits = binary.substring(12, 64);
        console.log(`expb: ${expBits} manb: ${manBits}`);
        let mantisa = 1;
        for (let i = 0; i < 52; i++) {
            mantisa += parseInt(manBits[i]) * Math.pow(2, -(i + 1));
        }
        let exponent = 0;
        for (let i = 0; i < 11; i++) {
            exponent += parseInt(expBits[i]) * Math.pow(2, 10 - i);
        }
        let expAdjusted = exponent - 1023
        let result = sign * mantisa * Math.pow(2, expAdjusted);
        console.log(`sign: ${sign} exp: ${expAdjusted} mant: ${mantisa}`);
        return result.toPrecision(4).toString();
    }
}

function randomByte() {
    return rand(0, 255, true, false);
}

function randomByteString() {
    return randomByte().toString(2).padStart(8, '0');
}

function distance(from, to) {
    return Math.sqrt((to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y));
}

function distanceX(from, to) {
    return Math.abs(to.x - from.x);
}

function distanceY(from, to) {
    return Math.abs(to.y - from.y);
}

function nearestCell(origin, memoryLabels) {
    let minDistance = Infinity;
    let closestCell = null;
    for (let i = 0; i < memoryLabels.length; i++) {
        let label = memoryLabels[i];
        let dist = distance(origin, { x: label.x, y: label.y });
        if (dist < minDistance) {
            minDistance = dist;
            closestCell = i;
        }
    }
    return closestCell;
}

class Type {
    constructor(size, color = orange) {
        this.size = size;
        this.color = color;
    }
}

const types = {
    "int": new Type(4),
    "char": new Type(1),
    "float": new Type(4),
    "double": new Type(8),
    "string": new Type(4)
};

function sizeOf(type) {
    return types[type].size;
}

function decode(memory, pos, type) {
    let size = sizeOf(type);
    if (memory.length - pos < size) {
        zog(`Error: not enough bytes to decode: there are ${memory.length} bytes, var starts at ${pos}, and size is ${size}`);
        return "ERROR";
    }
    else {
        let value = "Not decoded";
        let bstr = "";
        switch (type) {
            case "char":
                value = String.fromCharCode(parseInt(memory[pos], 2));
                break;
            case "int":
                bstr = "";
                for (let i = pos; i < pos + size; i++) {
                    bstr = memory[i] + bstr;
                }
                value = parseInt(bstr, 2);
                if (bstr[0] == '1') value = value - Math.pow(2, 8 * types["int"].size);
                value = value.toString();
                break;
            case "float":
                bstr = "";
                for (let i = pos; i < pos + size; i++) {
                    bstr = memory[i] + bstr;
                }
                value = binaryToFloat(bstr);
                break;
            case "double":
                bstr = "";
                for (let i = pos; i < pos + size; i++) {
                    bstr = memory[i] + bstr;
                }
                value = binaryToDouble(bstr);
                break;
            case "string":
                value = "";
                for (let i = pos; i < pos + size; i++) {
                    value = value + String.fromCharCode(parseInt(memory[i], 2));
                }
                break;
            default:
                value = "Unknown type";
        }
        return value;
    }
}

class Variable {
    constructor(stage, mem, memTile, memLabels, name, type) {
        this.stage = stage;
        this.mem = mem;
        this.memTile = memTile;
        this.memLabels = memLabels;
        this.name = name;
        this.type = type;
        this.box = new Rectangle({
            color: "rgba(127,127,127,0.3)",
            width: varWidth,
            height: cellHeight * sizeOf(type) + this.memTile.spacingV * (sizeOf(type) - 1),
            corner: 5
        }).reg(varWidth / 2, cellHeight / 2).addTo(this.memTile).drag({ all: true });
        this.label = new Label({
            text: name,
            size: 20,
            font: "courier",
            color: red
        }).addTo(this.box);
        this.closeButton = new Button({
            width: closeButtonWidth,
            height: closeButtonWidth,
            corner: 5,
            icon: pizzazz.makeIcon("close", "red")
        }).addTo(this.box).loc(this.box.width - closeButtonWidth, 0);
        this.closeButton.on("click", () => {
            this.box.off("pressup", this.pressupListener);
            this.destroy();
        });
        this.valueButton = new Button({
            width: cellWidth + 30,
            height: this.box.height,
            label: new Label({ text: "", font: "courier", color: grey, bold: true, lineWidth: 9 }),
            backgroundColor: "rgba(0, 255, 0, 0)",
            rollBackgroundColor: "rgba(251, 71, 88, 0.8)"
        }).addTo(this.box).center();
        this.box.mouseChildren = true;
        this.pressupListener = this.box.on("pressup", (event) => {
            let nearest = nearestCell(this.box, this.memLabels);
            let distX = distanceX(this.box, this.memLabels[nearest]);
            if (distX < this.memLabels[nearest].width * 0.5) {
                this.box.x = this.memLabels[nearest].x;
                this.box.y = this.memLabels[nearest].y;
                // decode(nearest, sizeOf(this.type), this.mem, this.memLabels);
                this.bind(nearest);
            }
            this.stage.update();
        });

        this.box.on("pressmove", () => {
            let nearest = nearestCell(this.box, this.memLabels);
            let distX = distanceX(this.box, this.memLabels[nearest]);
            let distY = distanceY(this.box, this.memLabels[nearest]);
            if ((distX < 0.5 * this.memLabels[nearest].width) && (distY < 0.25 * this.memLabels[nearest].height)) {
                // decode(nearest, sizeOf(this.type), this.mem, this.memLabels);
                this.bind(nearest);
            }
            else {
                // encode(nearest, sizeOf(this.type), this.mem, this.memLabels);
                this.unbind();
            }
            this.stage.update();
        });

        this.box.on("mousedown", () => {
            this.stage.update();
        });

    }
    bind(id) {
        this.valueButton.backgroundColor = orange;
        this.valueButton.text = decode(this.mem, id, this.type);
        this.stage.update();
    }
    unbind() {
        this.valueButton.backgroundColor = "rgba(0, 255, 0, 0)";
        this.valueButton.text = "";
        this.stage.update();
    }
    destroy() {
        // encodeAll(this.mem, this.memLabels);
        this.box.removeFrom(this.memTile);
        this.stage.update();
    }
}

function isBinary(num) {
    for (let digit of num) {
        if (digit != '0' && digit != '1') {
            return false;
        }
    }
    return true;
}

function editLabel(stage, label, memory, pos, tip) {
    let ta = new TextArea({
        width: cellWidth,
        height: cellHeight,
        size: 36,
        backgroundColor: orange
    }).addTo(label).center();
    ta.text = label.text;
    ta.setFocus();
    ta.keyFocus = true;
    ta.on("input", () => {
        if (!isBinary(ta.currentValue)) {
            tip.text = "Only '0' or '1' allowed!";
            tip.show();
            ta.tag.style.color = red;
        }
        else {
            if (ta.currentValue.length > 8) {
                tip.text = "Too long for a byte! 1 byte = 8 bits!";
                tip.show();
                ta.tag.style.color = red;
            }
            else {
                ta.tag.style.color = grey;
            }
        }
        stage.update();
    });
    ta.on("blur", () => {
        if (!isBinary(ta.currentValue)) {
            tip.text = "This is not binary!\nUndoing changes...";
            tip.show();
        }
        else {
            if (ta.currentValue.length > 8) {
                tip.text = "Too long for a byte.\nUndoing changes...";
                tip.show();
            }
            else {
                label.text = ta.currentValue.padStart(8, '0');
                memory[pos] = label.text;
            }
        }
        ta.removeFrom();
        stage.update();
    });
}

const frame = new Frame("fit", 1600, 900, light, dark);
frame.on("ready", () => {
    const stage = frame.stage;
    let stageW = frame.width;
    let stageH = frame.height;

    var memory = [];

    var memoryLabels = [];

    for (let i = 0; i < memsize; i++) {
        let memCellContents = randomByteString();
        let label = new Label({
            color: green,
            text: memCellContents,
            font: "courier",
            backing: new Rectangle(cellWidth, cellHeight, black).centerReg(),
            align: "right",
            valign: "middle"
        }).centerReg().cur("text");
        label.on("click", () => { editLabel(stage, label, memory, i, editTip); });
        memoryLabels.push(label);
        memory.push(memCellContents);
    }

    var memoryTile = new Tile({
        obj: memoryLabels,
        unique: true,
        rows: memsize,
        spacingV: 5,
    }).addTo();

    let editTip = new Tip({
        text: "hola",
        backgroundColor: red
    }).addTo().loc(frame.mouseX, frame.mouseY).hide();
    frame.on("mousemove", () => {
        console.log(frame.mouseX, frame.mouseY);
    });

    var varButtons = [];
    for (let type in types) {
        let b = new Button({
            width: 150,
            height: 100,
            label: new Label({ text: type, bold: true, font: "courier" }),
            backgroundColor: "rgb(127,127,127)",
            rollBackgroundColor: light
        }).centerReg();
        b.on("click", () => { new Variable(stage, memory, memoryTile, memoryLabels, "name", type) });
        varButtons.push(b);
    }
    new Tile({
        obj: varButtons,
        unique: true,
        rows: varButtons.length,
        spacingV: 5
    }).addTo().loc(cellHeight, cellHeight);

    var sink = new Circle(50, light).centerReg(stage).mov(-700,380).alp(1).cur("pointer");
    var particles = new Emitter({
        obj: new Circle(5, red),
        // life: 3,
        sink: sink,
        gravity: 0,
        force: 2.5
    }).centerReg(stage).mov(-700,380).sca(2);
    sink.on("click", () => {
        for (let i = 0; i < memory.length; i++) {
            let value = randomByteString();
            memory[i] = memoryLabels[i].text = value;
        }
    });

    memoryTile.center();

    stage.update();
});


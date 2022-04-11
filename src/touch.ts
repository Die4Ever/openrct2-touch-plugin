const plugin_name = 'OpenRCT2 Touch Controls';
const plugin_version = '0.1';

console.log("              \n"+plugin_name+" v"+plugin_version
    + ", OpenRCT2 API version "+context.apiVersion+', minimum required API version is 46, recommended API version is 51'
    + ', network.mode: '+network.mode+', context.mode: '+context.mode
);

function main()
{
    if (typeof ui === 'undefined') {
        console.log('ui is undefined');
        return;
    }

    ui.registerMenuItem("Touch Camera Controls", createCameraControlsWindow);
    createCameraControlsWindow();
}

registerPlugin({
    name: plugin_name,
    version: plugin_version,
    authors: ['Die4Ever'],
    type: 'remote',
    licence: "GPL-3.0",
    targetApiVersion: 51,
    minApiVersion: 46,
    main: main
});

let move_mult:number = 1;
let last_move:CoordsXY;
let last_move_timeout:number;

function moveCamera(move:CoordsXY) {
    let v:Viewport = ui.mainViewport;
    let move_amount:number = 100;

    if(last_move_timeout || last_move_timeout === 0) {
        context.clearTimeout(last_move_timeout);
        last_move_timeout = null;
    }
    if(last_move && last_move.x === move.x && last_move.y === move.y) {
        move_mult++;
        last_move_timeout = context.setTimeout(function() {
            last_move = null;
            move_mult = 1;
            last_move_timeout = null;
        }, 2000);
    } else {
        move_mult = 1;
    }
    last_move = move;

    let center:CoordsXY = v.getCentrePosition();
    let pos:CoordsXYZ = {
        x: center.x,
        y: center.y,
        z: 24
    }
    console.log('moveCamera from: ', pos, ', move: ', move, ', rotation: ', v.rotation);
    pos.x += move.x * move_amount * move_mult;
    pos.y += move.y * move_amount * move_mult;
    console.log('moveCamera to', pos);
    let oldFlags = v.visibilityFlags;
    v.scrollTo(pos);
    v.visibilityFlags = oldFlags;
}

function moveUp() {
    let v:Viewport = ui.mainViewport;
    let moves:CoordsXY[] = [
        {x: -1, y: -1},
        {x: 1, y: -1},
        {x: 1, y: 1},
        {x: -1, y: 1}
    ];
    moveCamera(moves[v.rotation]);
}

function moveDown() {
    let v:Viewport = ui.mainViewport;
    let moves:CoordsXY[] = [
        {x: 1, y: 1},
        {x: -1, y: 1},
        {x: -1, y: -1},
        {x: 1, y: -1}
    ];
    moveCamera(moves[v.rotation]);
}

function moveLeft() {
    let v:Viewport = ui.mainViewport;
    let moves:CoordsXY[] = [
        {x: 1, y: -1},
        {x: 1, y: 1},
        {x: -1, y: 1},
        {x: -1, y: -1}
    ];
    moveCamera(moves[v.rotation]);
}

function moveRight() {
    let v:Viewport = ui.mainViewport;
    let moves:CoordsXY[] = [
        {x: -1, y: 1},
        {x: -1, y: -1},
        {x: 1, y: -1},
        {x: 1, y: 1}
    ];
    moveCamera(moves[v.rotation]);
}

function createCameraControlsWindow() {
    let window:Window;
    let buttons:ButtonWidget[] = [];
    let padding_top = 20;
    let padding:number = 5;
    let button_size:number = 35;

    /*context.setInterval(function() {
        let v = ui.mainViewport;
        let pos:CoordsXY = v.getCentrePosition();
        if(!last_move) last_move = pos;
        let moved_x = pos.x - last_move.x;
        let moved_y = pos.y - last_move.y;
        console.log("moved x: ", moved_x, ', y: ', moved_y, ', ratio: ', (moved_x / moved_y), ', rotation: ',v.rotation);
        last_move = pos;

    }, 1000);*/

    buttons.push({
        type: 'button',
        name: 'zoom-out-button',
        x: padding,
        y: padding_top,
        width: button_size,
        height: button_size,
        text: '-',
        onClick: function() {
            ui.mainViewport.zoom += 1;
        }
    });

    buttons.push({
        type: 'button',
        name: 'up-button',
        x: button_size + padding*2,
        y: padding_top,
        width: button_size,
        height: button_size,
        text: '^',
        onClick: moveUp
    });

    buttons.push({
        type: 'button',
        name: 'zoom-in-button',
        x: button_size*2 + padding*3,
        y: padding_top,
        width: button_size,
        height: button_size,
        text: '+',
        onClick: function() {
            ui.mainViewport.zoom -= 1;
        }
    });

    buttons.push({
        type: 'button',
        name: 'down-button',
        x: button_size + padding*2,
        y: padding_top + padding + button_size,
        width: button_size,
        height: button_size,
        text: 'V',
        onClick: moveDown
    });

    buttons.push({
        type: 'button',
        name: 'left-button',
        x: padding,
        y: padding_top + padding + button_size,
        width: button_size,
        height: button_size,
        text: '<',
        onClick: moveLeft
    });

    buttons.push({
        type: 'button',
        name: 'right-button',
        x: button_size*2 + padding*3,
        y: padding_top + padding + button_size,
        width: button_size,
        height: button_size,
        text: '>',
        onClick: moveRight
    });

    /*let interval = context.setInterval(function(){
        for(let i:number = 0; i<buttons.length; i++) {
            if(buttons[i].isPressed) {
                buttons[i].onClick();
            }
        }
    }, 100);*/

    window = ui.openWindow({
        classification: 'touch-camera-controls',
        title: 'Touch Camera Controls',
        width: button_size*3 + padding*4,
        height: padding_top + button_size*2 + padding*2,
        widgets: buttons,
        onClose: function() {
            //context.clearInterval(interval);
        }
    });
}

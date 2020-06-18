const path = require('path');
const os = require('os');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');

const {app , shell, BrowserWindow, Menu ,ipcMain } = require('electron');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isWin = process.platform=='win32' ? true : false ;

let mainWindow;

function createBrowserWindow(){
        mainWindow = new BrowserWindow({
        title:'Image Scaler',
        height: 600,
        width:isDev ? 800: 500,
        icon:`${__dirname}/assets/mac/icon.png`,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile('./app/index.html');
}


function createAboutWindow(){
    aboutWindow = new BrowserWindow({
    title:'About Image Shrink',
    height: 400,
    width:400,
    icon:`${__dirname}/assets/mac/icon.png`,
    resizable: false,
})

aboutWindow.loadFile('./app/about.html');
}

app.on('ready', ()=>{
    createBrowserWindow()

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', ()=> mainWindow = null)
})


const menu = [
    ...(isWin ? []:[{
        label: app.name,
        submenu : [
            {
                label : 'About',
                click : createAboutWindow,
            }
        ]
    }]),
    {
        role: 'fileMenu',
    },
    ...(isWin ? [
        {
            label:'Help',
            submenu: [
                {
                    label:'About',
                    click: createAboutWindow,
                }
            ]
        }
    ]:[]),
    ...(isDev ? [
        {
            label : 'Developer',
            submenu: [
                {role: 'reload'},
                {role: 'forcereload'},
                {type: 'separator'},
                {role: 'toggledevtools'},
            ],
        },
    ]:[])
]

app.on('window-all-closed',()=>{
    if (process.platform !== 'darwin'){
        app.quit()
    }
})

ipcMain.on('image:minimize', (e,options) => {
    options.dest = path.join(os.homedir(),'imagescalar')
    shrinkImage(options)
})

async function shrinkImage({imgPath,quality,dest}) {
    try {
        const qualpng = quality/100
        const files = await imagemin([slash(imgPath)],{
            destination: dest,
            plugins:[
                imageminMozjpeg({ quality }),
                imageminPngquant({
                    quality:[qualpng,qualpng]
                    })
                ]
            })

            console.log(files);
            shell.openPath(dest);
    }catch(err){
        console.log(err);
    }
}

app.on('activate',()=>{
    if(BrowserWindow.getAllWindows().length === 0){
        createBrowserWindow()
    }
})

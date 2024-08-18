package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "hermes-gui",
		Width:             1024,
		Height:            768,
		MinWidth:          1024,
		MinHeight:         768,
		MaxWidth:          1920,
		MaxHeight:         1080,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		Assets:            assets,
		Menu:              nil,
		Logger:            nil,
		LogLevel:          logger.DEBUG,
		OnStartup:         app.startup,
		OnDomReady:        app.domReady,
		OnBeforeClose:     app.beforeClose,
		OnShutdown:        app.shutdown,
		WindowStartState:  options.Normal,
		Bind: []interface{}{
			app,
			&ProfileEntity{},
			&Project{},
			&CoreData{},
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: "",
		},
		// Mac platform specific options
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  false,
				HideTitleBar:               false,
				FullSizeContent:            false,
				UseToolbar:                 true,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "hermes-gui",
				Message: "",
				Icon:    icon,
			},
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}

type ProfileEntity struct {
	Id          int    `json:"id"`
	ProfileName string `json:"profileName"`
	IsSelected  bool   `json:"isSelected"`
}

type Project struct {
	Profiles []ProfileEntity `json:"profiles"`
	Name     string          `json:"name"`
}

type CoreData struct {
	Projects       map[string]Project `json:"projects"`
	CurrentProject string             `json:"currentProject"`
}

var data CoreData

func (a *App) LoadInitialData() *CoreData {
	testProfile := ProfileEntity{ProfileName: "testing", IsSelected: true}
	projects := make(map[string]Project)
	projects["default"] = Project{Name: "default", Profiles: []ProfileEntity{testProfile}}
	data.Projects = projects
	data = CoreData{CurrentProject: "default", Projects: projects}
	return &data
}

func (a *App) SaveProject(project Project) {
	data.Projects[project.Name] = project
}

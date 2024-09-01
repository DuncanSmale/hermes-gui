package main

import (
	"context"
	"database/sql"
	"embed"
	"log"
	"os"
	"time"

	_ "modernc.org/sqlite"

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

var DB *sql.DB

func Connect(path string) {
	createDb := false
	if _, err := os.Stat(path); err != nil {
		file, err := os.Create(path)
		checkError(err)
		file.Close()
		createDb = true
	}
	db, err := sql.Open("sqlite", path)
	checkError(err)
	time.Sleep(time.Millisecond * 2000)
	DB = db
	if createDb {
		deploy()
	}
}

func deploy() {
	_, err := DB.ExecContext(
		context.Background(),
		`CREATE TABLE IF NOT EXISTS profile(
      id integer NOT NULL PRIMARY KEY AUTOINCREMENT, 
      projectName varchar(50),
      profileName varchar(50), 
      isSelected bit)`,
	)
	checkError(err)
	q, err := DB.ExecContext(
		context.Background(),
		`INSERT INTO profile
      (projectName, profileName, isSelected) 
    VALUES  
      ('testing project', 'tesitng', 1),
      ('testing project', 'testing 2', 1),
      ('testing project', 'testing 3', 1)`,
	)
	val, err := q.LastInsertId()
	log.Printf("%d", val)
	checkError(err)
}

func checkError(err error) {
	if err != nil {
		log.Fatal(err)
		panic(err)
	}
}

func main() {
	// Create an instance of the app structure
	app := NewApp()
	Connect("./test.db")

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

type ProjectDbRow struct {
	ID int
	ProfileDb
}

type ProfileDb struct {
	ProjectName string
	ProfileName string
	IsSelected  bool
}

func getAllProfiles() (CoreData, error) {
	Connect("./test.db")
	var allProfiles []ProjectDbRow
	rows, err := DB.QueryContext(
		context.Background(),
		`SELECT * FROM profile`,
	)
	checkError(err)
	defer rows.Close()
	log.Print(rows)
	for rows.Next() {

		var profile ProjectDbRow

		if err := rows.Scan(
			&profile.ID, &profile.ProjectName, &profile.ProfileName, &profile.IsSelected,
		); err != nil {
			checkError(err)
		}
		allProfiles = append(allProfiles, profile)
	}
	active := ""
	projects := make(map[string]Project)
	for _, profile := range allProfiles {
		newProfile := ProfileEntity{Id: profile.ID, ProfileName: profile.ProfileName, IsSelected: profile.IsSelected}
		_, ok := projects[profile.ProjectName]
		if !ok {
			projects[profile.ProjectName] = Project{Name: profile.ProjectName, Profiles: make([]ProfileEntity, 0)}
		}
		if active == "" {
			active = profile.ProjectName
		}

		project := projects[profile.ProjectName]
		project.Profiles = append(project.Profiles, newProfile)
		projects[profile.ProjectName] = project
	}

	data = CoreData{CurrentProject: active, Projects: projects}

	return data, err
}

var data CoreData

func (a *App) LoadInitialData() *CoreData {
	data, _ = getAllProfiles()

	return &data
}

func (a *App) SaveProject(project Project) {
	data.Projects[project.Name] = project
}

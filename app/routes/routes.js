import HomeScreen from "../components/Connector/homeScreen.js";
import ActivitySelectorScreen from "../components/ActivitySelector/activitySelectorScreen";
import CognitiveEnhancementScreen from "../components/CognitiveEnhancement/CognitiveEnhancementScreen";
import GameListScreen from "../components/GameList/gameListScreen";
import CognitiveSessionMonitorScreen from "../components/CognitiveEnhancement/cognitiveSessionMonitorScreen";
import EyetrackerCalibrationScreen from "../components/EyetrackerCalibration/eyetrackerCalibrationScreen";
import ComposeScreen from "../components/Composer/composeScreen.js";
import SettingsScreen from "../components/Settings/settingsScreen.js";
import flowComposerScreen from "../components/flowComposer/flowComposerScreen";
import CardBuilderScreen from "../components/CardBuilder/CardBuilderScreen";
import ContentImporterScreen from "../components/CardBuilder/contentImporterScreen";
import PageEditScreen from "../components/PageEditScreen/pageEditScreen";
import PatientSelectionScreen from "../components/PatientSelectionScreen/patientSelectionScreen";
import UserLibraryScreen from "../components/UserLibraryScreen/userLibraryScreen";
import TreeSelectionScreen from "../components/TreeSelectionScreen/treeSelectionScreen";
import CameraScreen from "../utils/cameraScreen";
import AudioRecorderScreen from "../utils/audioRecorderScreen";
import GameDetailScreen from "../components/GameDetail/gameDetailScreen";

const Routes = {
    Home: { screen: HomeScreen },
    ActivitySelector: { screen: ActivitySelectorScreen },
    CognitiveEnhancement: { screen: CognitiveEnhancementScreen },
    GameList: { screen: GameListScreen },
    CognitiveSessionMonitor: { screen: CognitiveSessionMonitorScreen },
    EyetrackerCalibration: { screen: EyetrackerCalibrationScreen },
    Compose: { screen: ComposeScreen },
    Settings: { screen: SettingsScreen },
    flowComposer: { screen: flowComposerScreen },
    cardBuilder: { screen: CardBuilderScreen },
    ContentImporter: { screen: ContentImporterScreen },
    PageEdit: { screen: PageEditScreen },
    PatientSelection: { screen: PatientSelectionScreen },
    UserLibrary: { screen: UserLibraryScreen },
    TreeSelection: { screen: TreeSelectionScreen },
    Camera: { screen: CameraScreen },
    AudioRecorder: { screen: AudioRecorderScreen },
    GameDetail: { screen: GameDetailScreen },
};

export default Routes;
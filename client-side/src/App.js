import NavBar from "./component/NavBar";
import Home from "./views/commonPages/Home";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";
import LoginPatient from "./views/patientPages/LoginPatient";
import RegisterPatient from "./views/patientPages/RegisterPatient";
import LandingPage from "./views/patientPages/LandingPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LoginTherapist from "./views/therapistPages/LoginTherapist";
import RegisterTherapist from "./views/therapistPages/RegisterTherapist";
import CommunitySpace from "./views/commonPages/CommunitySpace";
import CommunityDetail from "./views/commonPages/CommunityDetail";
import Profile from "./views/commonPages/Profile";
import NotificationPatient from "./views/patientPages/NotificationPatient";
import ViewTherapist from "./views/patientPages/ViewTherapist";
import Message from "./views/commonPages/Message";
import MessageBox from "./views/commonPages/MessageBox";
import Dashboard from "./views/therapistPages/Dashboard";
import Footer from "./component/Footer";
import Appointments from "./views/therapistPages/Appointments";
import NotificationTherapist from "./views/therapistPages/NotificationTherapist";
import Records from "./views/therapistPages/Records";
import RecordsDetail from "./views/therapistPages/RecordsDetail";
import VideoChat from "./views/therapistPages/VideoChatTherapist";
import VideoChatPatient from "./views/patientPages/VideoChatPatient";
import VerifyEmail from "./views/commonPages/VerifyEmail";
import PredictionQuestionnaire from "./views/patientPages/PredictionQuestionnaire";
import ForgotPassword from "./views/commonPages/ForgotPassword";
import ResetPassword from "./views/commonPages/ResetPassword";
import TermsAndConditions from "./views/commonPages/TermsAndConditions";


function App() {

  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <NavBar />
          <div className="content">
            <Switch>
              <Route component={Home} path="/" exact />
              <Route component={LoginPatient} path="/login-p" exact />
              <Route component={TermsAndConditions} path="/terms-and-conditions" exact />
              <Route component={RegisterPatient} path="/register-p" exact />
              <PrivateRoute component={LandingPage} path="/home-p" exact />
              <Route component={LoginTherapist} path="/login-t" exact />
              <Route component={RegisterTherapist} path="/register-t" exact />
              <PrivateRoute component={PredictionQuestionnaire} path="/questionnaire" exact />
              <Route component={VerifyEmail} path="/verify-email/:uid/:token"  exact/>
              <Route component={ForgotPassword} path="/forgot-password"  exact/>
              <Route component={ResetPassword} path="/reset-password/:uidb64/:token"  exact/>
              <PrivateRoute
                component={CommunitySpace}
                path="/community-space"
                exact
              />
              <PrivateRoute
                component={CommunityDetail}
                path="/community-space/:id"
                exact
              />
              <PrivateRoute component={Profile} path="/profile" exact />
              <PrivateRoute
                component={NotificationPatient}
                path="/notification-p"
                exact
              />
              <PrivateRoute
                component={ViewTherapist}
                path="/viewtherapist/:id"
                exact
              />
              <Route component={Dashboard} path="/dashboard-t" exact />
              <Route
                component={Appointments}
                path="/appointments-t"
                exact
              />
              <Route
                component={NotificationTherapist}
                path="/notification-t"
                exact
              />
              <Route component={Records} path="/records-t" exact />
              <Route component={RecordsDetail} path="/records-t/:id" exact />
              <PrivateRoute component={MessageBox} path="/message-box/" exact />
              <PrivateRoute component={Message} path="/message/:id" exact />
              <PrivateRoute component={VideoChat} path="/videochat-t/:id" exact/>
              <PrivateRoute component={VideoChatPatient} path="/videochat-p/:id" exact/>
            </Switch>
          </div>
          <Footer />
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

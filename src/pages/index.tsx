import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/datetime2/lib/css/blueprint-datetime2.css';

import {FocusStyleManager} from '@blueprintjs/core';
import MainPage from '@/main';

FocusStyleManager.onlyShowFocusOnTabs();

function Home() {
    return <MainPage />;
}

export default Home;

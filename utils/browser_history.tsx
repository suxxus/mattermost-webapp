// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createBrowserHistory} from 'history';

import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {isDesktopApp, getDesktopVersion} from 'utils/user_agent';

const b = createBrowserHistory({basename: window.basename});
const isDesktop = isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '5.0.0');

type Data = {
    type?: string;
    message?: Record<string, string>;
}

type Params = {
    origin?: string;
    data?: Data;
}

window.addEventListener('message', ({origin, data: {type, message = {}} = {}}: Params = {}) => {
    if (origin !== window.location.origin) {
        return;
    }

    switch (type) {
    case 'browser-history-push-return': {
        if (message.pathName) {
            const {pathName} = message;
            b.push(pathName);
        }
        break;
    }
    }
});

export const browserHistory = {
    ...b,
    push: (path: string | { pathname: string }, ...args: string[]) => {
        if (isDesktop) {
            window.postMessage(
                {
                    type: 'browser-history-push',
                    message: {
                        path: typeof path === 'object' ? path.pathname : path,
                    },
                },
                window.location.origin,
            );
        } else {
            b.push(path, ...args);
        }
    },
};

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';

import {Tooltip} from 'react-bootstrap';

import {getCurrentChannel, getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {getActivePluginId} from 'selectors/rhs';

import {PluginComponent} from 'types/store/plugins';
import Constants, {suitePluginIds} from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import PluginIcon from 'components/widgets/icons/plugin_icon';

import NewChannelWithBoardTourTip from './new_channel_with_board_tour_tip';

type PluginComponentProps = {
    component: PluginComponent;
}

enum ImageLoadState {
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error',
}

const AppBarPluginComponent = (props: PluginComponentProps) => {
    const {component} = props;

    const channel = useSelector(getCurrentChannel);
    const channelMember = useSelector(getMyCurrentChannelMembership);
    const activePluginId = useSelector(getActivePluginId);

    const [imageLoadState, setImageLoadState] = useState<ImageLoadState>(ImageLoadState.LOADING);

    useEffect(() => {
        setImageLoadState(ImageLoadState.LOADING);
    }, [component.iconUrl]);

    const onImageLoadComplete = () => {
        setImageLoadState(ImageLoadState.LOADED);
    };

    const onImageLoadError = () => {
        setImageLoadState(ImageLoadState.ERROR);
    };

    const buttonId = `app-bar-icon-${component.pluginId}`;
    const tooltipText = component.tooltipText || component.dropdownText || component.pluginId;
    const tooltip = (
        <Tooltip id={'pluginTooltip-' + buttonId}>
            <span>{tooltipText}</span>
        </Tooltip>
    );

    const iconUrl = component.iconUrl;
    let content: React.ReactNode = (
        <div className='app-bar__icon-inner'>
            <img
                src={iconUrl}
                onLoad={onImageLoadComplete}
                onError={onImageLoadError}
            />
        </div>
    );

    const isButtonActive = component.pluginId === activePluginId;

    if (!iconUrl) {
        content = (
            <div className={classNames('app-bar__old-icon app-bar__icon-inner app-bar__icon-inner--centered', {'app-bar__old-icon--active': isButtonActive})}>
                {component.icon}
            </div>
        );
    }

    if (imageLoadState === ImageLoadState.ERROR) {
        content = (
            <PluginIcon className='icon__plugin'/>
        );
    }

    return (
        <OverlayTrigger
            trigger={['hover', 'focus']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='left'
            overlay={tooltip}
        >
            <div
                id={buttonId}
                className={classNames('app-bar__icon', {'app-bar__icon--active': isButtonActive})}
                onClick={() => {
                    component.action?.(channel, channelMember);
                }}
            >
                {content}
                {component.pluginId === suitePluginIds.focalboard && <NewChannelWithBoardTourTip/>}
            </div>
        </OverlayTrigger>
    );
};

export default AppBarPluginComponent;

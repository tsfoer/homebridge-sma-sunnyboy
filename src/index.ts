import { API } from 'homebridge';

import {ACCESSORY_NAME2} from './settings';
import {ExampleSwitch} from './platformAccessory';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(ACCESSORY_NAME2, ExampleSwitch);
};

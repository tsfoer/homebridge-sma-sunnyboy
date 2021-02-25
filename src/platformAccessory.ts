import {
  Service,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  AccessoryPlugin,
  Logging,
  AccessoryConfig, API,
} from 'homebridge';
import {randomInt} from 'crypto';
import ModbusRTU from 'modbus-serial';

export class ExampleSwitch implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly name: string;
  private switchOn = false;

  private readonly switchService: Service;
  private readonly informationService: Service;
  private readonly testService: Service;

  private modbus;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;

    this.modbus = new ModbusRTU();

    this.switchService = new api.hap.Service.Switch(this.name);
    this.switchService.getCharacteristic(api.hap.Characteristic.On)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        log.info('Current state of the switch was returned: ' + (this.switchOn? 'ON': 'OFF'));
        callback(undefined, this.switchOn);
      })
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.switchOn = value as boolean;
        log.info('Switch state was set to: ' + (this.switchOn? 'ON': 'OFF'));
        callback();
      });

    this.informationService = new api.hap.Service.AccessoryInformation()
      .setCharacteristic(api.hap.Characteristic.Manufacturer, 'Custom Manufacturer')
      .setCharacteristic(api.hap.Characteristic.Model, 'Custom Model');

    this.testService = new api.hap.Service.LightSensor('mudda')
      .setCharacteristic(api.hap.Characteristic.Name, 'LOL');

    this.testService.getCharacteristic(api.hap.Characteristic.CurrentAmbientLightLevel).on('get', this.handleTestKhW.bind(this));

    log.info('Switch finished initializing!');
  }

  handleTestKhW(callback) {
    try {
      this.log.debug('connecting to Sunnyboy ');
      this.modbus.connectTCP('192.168.178.80', {port: 8502});
      //this.modbus.connectTCP('192.168.178.80');
      this.modbus.setID(3);

      this.modbus.readHoldingRegisters(30775, 10, (err, data) => {
        console.log(err, data);
      });
    } catch (err) {
      this.log.error(err);
    }

    callback(null, 1);
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log('Identify!');
  }


  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
      this.testService,
    ];
  }

}


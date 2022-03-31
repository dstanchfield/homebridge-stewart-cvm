import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { ExampleHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class AspectRatioAccessory {
  private service: Service;
  private switchState: CharacteristicValue = false;

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    public readonly aspectRatioDetails,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Stewart')
      .setCharacteristic(this.platform.Characteristic.Model, 'CVM')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, aspectRatioDetails.displayName);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.aspectRatioDetails.cvmClient.onChange(this.handleExternalControl.bind(this));
  }

  handleExternalControl(position) {
    if (position === this.aspectRatioDetails.position) {
      this.switchState = 1;
    } else {
      this.service.updateCharacteristic(this.platform.Characteristic.On, 0);
      this.switchState = 0;
    }
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    this.platform.log.debug('Set Characteristic On ->', value);

    if (value && !this.switchState) {
      this.switchState = value;
      this.aspectRatioDetails.cvmClient.call(this.aspectRatioDetails.position);
    } else if (this.switchState) {
      this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(1);
    }
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.switchState;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    return isOn;
  }

}

import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { StewartCvmPlatform } from './platform';

export class AspectRatioAccessory {
  private service: Service;
  private switchState: CharacteristicValue = false;

  constructor(
    private readonly platform: StewartCvmPlatform,
    private readonly accessory: PlatformAccessory,
    public readonly aspectRatioDetails,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Stewart')
      .setCharacteristic(this.platform.Characteristic.Model, 'CVM')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, aspectRatioDetails.displayName);

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

  async setOn(value: CharacteristicValue) {
    this.platform.log.debug('Set Characteristic On ->', value);

    if (value && !this.switchState) {
      this.switchState = value;
      this.aspectRatioDetails.cvmClient.call(this.aspectRatioDetails.position);
    } else if (this.switchState) {
      setTimeout((() => {
        this.service.updateCharacteristic(this.platform.Characteristic.On, 1);
      }).bind(this), 100);
    }
  }

  async getOn(): Promise<CharacteristicValue> {
    const isOn = this.switchState;

    this.platform.log.debug('Get Characteristic On ->', isOn);

    return isOn;
  }

}

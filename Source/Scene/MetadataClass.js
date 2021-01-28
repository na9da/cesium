import Check from "../Core/Check.js";
import clone from "../Core/clone.js";
import defaultValue from "../Core/defaultValue.js";
import MetadataProperty from "./MetadataProperty.js";

/**
 * A metadata class.
 *
 * @param {Object} options Object with the following properties:
 * @param {String} options.id The ID of the class.
 * @param {Object} options.class The class JSON object.
 * @param {Object.<String, MetadataEnum>} [options.enums] A dictionary of enums.
 *
 * @alias MetadataClass
 * @constructor
 *
 * @private
 */
function MetadataClass(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var id = options.id;
  var classDefinition = options.class;

  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.string("options.id", id);
  Check.typeOf.object("options.class", classDefinition);
  //>>includeEnd('debug');

  var properties = {};
  for (var propertyId in classDefinition.properties) {
    if (classDefinition.properties.hasOwnProperty(propertyId)) {
      properties[propertyId] = new MetadataProperty({
        id: propertyId,
        property: classDefinition.properties[propertyId],
        enums: options.enums,
      });
    }
  }

  this._properties = properties;
  this._id = id;
  this._name = classDefinition.name;
  this._description = classDefinition.description;
  this._extras = clone(classDefinition.extras, true); // Clone so that this object doesn't hold on to a reference to the JSON
}

Object.defineProperties(MetadataClass.prototype, {
  /**
   * The class properties.
   *
   * @memberof MetadataClass.prototype
   * @type {Object.<String, MetadataProperty>}
   * @readonly
   * @private
   */
  properties: {
    get: function () {
      return this._properties;
    },
  },

  /**
   * The ID of the class.
   *
   * @memberof MetadataClass.prototype
   * @type {String}
   * @readonly
   * @private
   */
  id: {
    get: function () {
      return this._id;
    },
  },

  /**
   * The name of the class.
   *
   * @memberof MetadataClass.prototype
   * @type {String}
   * @readonly
   * @private
   */
  name: {
    get: function () {
      return this._name;
    },
  },

  /**
   * The description of the class.
   *
   * @memberof MetadataClass.prototype
   * @type {String}
   * @readonly
   * @private
   */
  description: {
    get: function () {
      return this._description;
    },
  },

  /**
   * Extras in the JSON object.
   *
   * @memberof MetadataClass.prototype
   * @type {*}
   * @readonly
   * @private
   */
  extras: {
    get: function () {
      return this._extras;
    },
  },
});

export default MetadataClass;
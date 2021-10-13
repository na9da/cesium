import { FeatureMetadata, MetadataSchema } from "../../Source/Cesium.js";

describe("Scene/FeatureMetadata", function () {
  var featureTablesSchema = {
    classes: {
      building: {
        properties: {
          name: {
            type: "STRING",
          },
          height: {
            type: "FLOAT64",
          },
        },
      },
      tree: {
        properties: {
          species: {
            type: "STRING",
          },
        },
      },
    },
  };

  var featureTexturesSchema = {
    classes: {
      map: {
        properties: {
          color: {
            type: "ARRAY",
            componentType: "UINT8",
            componentCount: 3,
          },
          intensity: {
            type: "UINT8",
          },
        },
      },
      ortho: {
        properties: {
          vegetation: {
            type: "UINT8",
            normalized: true,
          },
        },
      },
    },
  };

  it("creates feature metadata with default values", function () {
    var metadata = new FeatureMetadata({
      schema: new MetadataSchema(featureTablesSchema),
    });

    expect(metadata.schema).toBeDefined();
    expect(metadata.statistics).toBeUndefined();
    expect(metadata.extras).toBeUndefined();
    expect(metadata.extensions).toBeUndefined();
  });

  it("creates feature metadata", function () {
    var mockFeatureTables = [
      { id: 0, name: "Buildings" },
      { id: 1, name: "Trees" },
    ];
    var metadata = new FeatureMetadata({
      schema: new MetadataSchema(featureTablesSchema),
      featureTables: mockFeatureTables,
    });

    expect(metadata.featureTableCount).toEqual(2);

    var buildingClass = metadata.schema.classes.building;
    var treeClass = metadata.schema.classes.tree;

    expect(buildingClass.id).toBe("building");
    expect(treeClass.id).toBe("tree");

    var buildingsTable = metadata.getFeatureTable(0);
    var treesTable = metadata.getFeatureTable(1);

    expect(buildingsTable).toBe(mockFeatureTables[0]);
    expect(treesTable).toBe(mockFeatureTables[1]);
  });

  it("creates feature metadata with feature textures", function () {
    var schema = new MetadataSchema(featureTexturesSchema);
    var mapClass = schema.classes.map;
    var orthoClass = schema.classes.ortho;

    var mockTextures = [
      {
        id: 0,
        name: "Map Texture",
        class: mapClass,
      },
      {
        id: 1,
        name: "Ortho Texture",
        class: orthoClass,
      },
    ];

    var metadata = new FeatureMetadata({
      schema: schema,
      featureTextures: mockTextures,
    });

    expect(mapClass.id).toBe("map");
    expect(orthoClass.id).toBe("ortho");

    var mapTexture = metadata.getFeatureTexture(0);
    var orthoTexture = metadata.getFeatureTexture(1);

    expect(mapTexture.id).toBe(0);
    expect(mapTexture.name).toBe("Map Texture");
    expect(mapTexture.class).toBe(mapClass);
    expect(orthoTexture.id).toBe(1);
    expect(orthoTexture.name).toBe("Ortho Texture");
    expect(orthoTexture.class).toBe(orthoClass);
  });

  it("creates feature metadata with extras", function () {
    var extras = {
      date: "2021-04-14",
    };

    var metadata = new FeatureMetadata({
      extras: extras,
      schema: new MetadataSchema(featureTablesSchema),
    });

    expect(metadata.extras).toBe(extras);
  });

  it("creates feature metadata with extensions", function () {
    var extensions = {
      "3DTILES_extension": {},
    };

    var metadata = new FeatureMetadata({
      extensions: extensions,
      schema: new MetadataSchema(featureTablesSchema),
    });

    expect(metadata.extensions).toBe(extensions);
  });

  it("creates feature metadata with statistics", function () {
    var statistics = {
      classes: {
        tree: {
          count: 100,
          properties: {
            height: {
              min: 10.0,
              max: 20.0,
            },
          },
        },
      },
    };

    var metadata = new FeatureMetadata({
      statistics: statistics,
      schema: new MetadataSchema(featureTablesSchema),
    });

    expect(metadata.statistics).toBe(statistics);
  });

  it("getFeatureTable throws without featureTableId", function () {
    var metadata = new FeatureMetadata({
      extension: {},
      schema: new MetadataSchema(featureTablesSchema),
    });

    expect(function () {
      metadata.getFeatureTable();
    }).toThrowDeveloperError();
  });

  it("getFeatureTexture throws without featureTextureId", function () {
    var metadata = new FeatureMetadata({
      extension: {},
      schema: new MetadataSchema(featureTexturesSchema),
    });

    expect(function () {
      metadata.getFeatureTexture();
    }).toThrowDeveloperError();
  });
});

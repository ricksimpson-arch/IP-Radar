import { describe, expect, it } from "vitest";
import {
  EconomicLayer,
  LayerMismatchError,
  TermsUnmappedError,
  type AgreementVersion,
  fyulContribution,
  fyulRecognized,
  gms,
  money,
  pipelineEv,
  storeNetSales,
} from "../src/index.js";
import fixtures from "./fixtures/launches.json" with { type: "json" };

interface LaunchFixture {
  id: string;
  currency: string;
  inputs: {
    orders: number;
    realizedAovCents: number;
    discountsCents: number;
    cancellationsCents: number;
    refundsCents: number;
    chargebacksCents: number;
    excludedTaxesDutiesCents: number;
    agreement: AgreementVersion;
    variableCostsCents: number;
    committedLaunchCostsCents: number;
    guaranteeExposureCents: number;
    writeDownsCents: number;
    pRightsWin: number;
    delayDiscount: number;
    capacityFeasibility: number;
  };
  expected: Record<keyof typeof EconomicLayer, number>;
}

describe("golden fixtures: five-layer identities match hand-computed values to the cent", () => {
  for (const launch of fixtures.launches as unknown as LaunchFixture[]) {
    it(launch.id, () => {
      const { inputs, expected } = launch;

      const gmsValue = gms({
        orders: inputs.orders,
        realizedAovCents: inputs.realizedAovCents,
        currency: launch.currency,
      });
      expect(gmsValue.layer).toBe(EconomicLayer.CONSUMER_GMS);
      expect(gmsValue.amountCents).toBe(expected.CONSUMER_GMS);

      const netValue = storeNetSales({
        gms: gmsValue,
        discountsCents: inputs.discountsCents,
        cancellationsCents: inputs.cancellationsCents,
        refundsCents: inputs.refundsCents,
        chargebacksCents: inputs.chargebacksCents,
        excludedTaxesDutiesCents: inputs.excludedTaxesDutiesCents,
      });
      expect(netValue.layer).toBe(EconomicLayer.STORE_NET_SALES);
      expect(netValue.amountCents).toBe(expected.STORE_NET_SALES);

      const recognized = fyulRecognized({
        agreement: inputs.agreement,
        bases: {
          [EconomicLayer.CONSUMER_GMS]: gmsValue,
          [EconomicLayer.STORE_NET_SALES]: netValue,
        },
      });
      expect(recognized.layer).toBe(EconomicLayer.FYUL_RECOGNIZED);
      expect(recognized.amountCents).toBe(expected.FYUL_RECOGNIZED);

      const contribution = fyulContribution({
        recognized,
        variableCostsCents: inputs.variableCostsCents,
        committedLaunchCostsCents: inputs.committedLaunchCostsCents,
        guaranteeExposureCents: inputs.guaranteeExposureCents,
        writeDownsCents: inputs.writeDownsCents,
      });
      expect(contribution.layer).toBe(EconomicLayer.FYUL_CONTRIBUTION);
      expect(contribution.amountCents).toBe(expected.FYUL_CONTRIBUTION);

      const ev = pipelineEv({
        pRightsWin: inputs.pRightsWin,
        conditionalContribution: contribution,
        delayDiscount: inputs.delayDiscount,
        capacityFeasibility: inputs.capacityFeasibility,
      });
      expect(ev.layer).toBe(EconomicLayer.PIPELINE_EV);
      expect(ev.amountCents).toBe(expected.PIPELINE_EV);
    });
  }
});

describe("TERMS_UNMAPPED guard: never estimate, never default", () => {
  const usdBase = (layer: EconomicLayer.CONSUMER_GMS | EconomicLayer.STORE_NET_SALES) =>
    money(1_000_000, "USD", layer);
  const bases = {
    [EconomicLayer.CONSUMER_GMS]: usdBase(EconomicLayer.CONSUMER_GMS),
    [EconomicLayer.STORE_NET_SALES]: usdBase(EconomicLayer.STORE_NET_SALES),
  };

  for (const unmapped of fixtures.unmappedCases) {
    it(unmapped.id, () => {
      expect(() =>
        fyulRecognized({ agreement: unmapped.agreement as AgreementVersion, bases })
      ).toThrowError(TermsUnmappedError);
      try {
        fyulRecognized({ agreement: unmapped.agreement as AgreementVersion, bases });
      } catch (err) {
        expect((err as TermsUnmappedError).code).toBe("TERMS_UNMAPPED");
      }
    });
  }

  it("missing agreement entirely", () => {
    expect(() => fyulRecognized({ agreement: null, bases })).toThrowError(TermsUnmappedError);
  });

  it("rate component with no matching base provided", () => {
    const agreement: AgreementVersion = {
      agreementId: "AGR-NO-BASE",
      version: 1,
      currency: "USD",
      components: [{ kind: "ROYALTY", rateBps: 1000, baseLayer: EconomicLayer.STORE_NET_SALES }],
    };
    expect(() =>
      fyulRecognized({ agreement, bases: { [EconomicLayer.CONSUMER_GMS]: bases.CONSUMER_GMS } })
    ).toThrowError(TermsUnmappedError);
  });
});

describe("layer blending is impossible", () => {
  it("storeNetSales rejects a non-GMS input", () => {
    const wrongLayer = money(100, "USD", EconomicLayer.STORE_NET_SALES);
    expect(() =>
      storeNetSales({
        gms: wrongLayer,
        discountsCents: 0,
        cancellationsCents: 0,
        refundsCents: 0,
        chargebacksCents: 0,
        excludedTaxesDutiesCents: 0,
      })
    ).toThrowError(LayerMismatchError);
  });

  it("fyulContribution rejects a non-recognized input", () => {
    const wrongLayer = money(100, "USD", EconomicLayer.CONSUMER_GMS);
    expect(() =>
      fyulContribution({
        recognized: wrongLayer,
        variableCostsCents: 0,
        committedLaunchCostsCents: 0,
        guaranteeExposureCents: 0,
        writeDownsCents: 0,
      })
    ).toThrowError(LayerMismatchError);
  });

  it("pipelineEv rejects a non-contribution input", () => {
    const wrongLayer = money(100, "USD", EconomicLayer.FYUL_RECOGNIZED);
    expect(() =>
      pipelineEv({
        pRightsWin: 0.5,
        conditionalContribution: wrongLayer,
        delayDiscount: 1,
        capacityFeasibility: 1,
      })
    ).toThrowError(LayerMismatchError);
  });

  it("probabilities and factors outside [0,1] are rejected", () => {
    const contribution = money(100, "USD", EconomicLayer.FYUL_CONTRIBUTION);
    expect(() =>
      pipelineEv({ pRightsWin: 1.2, conditionalContribution: contribution, delayDiscount: 1, capacityFeasibility: 1 })
    ).toThrowError(RangeError);
  });

  it("money amounts must be integer cents", () => {
    expect(() => money(10.5, "USD", EconomicLayer.CONSUMER_GMS)).toThrowError(RangeError);
  });
});

describe("contribution may legitimately be negative (a loss), EV scales it", () => {
  it("handles a loss-making launch without clamping", () => {
    const recognized = money(100_000, "USD", EconomicLayer.FYUL_RECOGNIZED);
    const contribution = fyulContribution({
      recognized,
      variableCostsCents: 80_000,
      committedLaunchCostsCents: 30_000,
      guaranteeExposureCents: 10_000,
      writeDownsCents: 0,
    });
    expect(contribution.amountCents).toBe(-20_000);
    const ev = pipelineEv({
      pRightsWin: 0.5,
      conditionalContribution: contribution,
      delayDiscount: 1,
      capacityFeasibility: 1,
    });
    expect(ev.amountCents).toBe(-10_000);
  });
});

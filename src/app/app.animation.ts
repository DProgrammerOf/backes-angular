import { trigger, animate, transition, style, group, query, state } from "@angular/animations";

export const fadeInOutAnimation = trigger('routeAnimations', [
    transition('* => LoginPage, LoginPage => ClientePage', [
        query(':enter', style({}), {optional:true}),
        group([
            query(':enter', [
                style({ opacity: 0 }),
                animate('0.5s ease-in', style({ opacity: 1 }))
            ], {optional:true}),
        ])
    ])
]);

export const slideVeiculoMapPopup = trigger('animationMapPopup', [
    state('opened', style({bottom: 0})),
    state('closed', style({bottom: "-100%"})),
    transition('closed => opened', [
        animate('150ms', style({ bottom: 0 })),
    ]),
    transition('opened => closed', [
        animate('100ms', style({ bottom: '-100%' })),
    ])
]);

// App cliente
export const slideOutAnimation = trigger('routeVeiculosAnimations', [
    state('VeiculosCercasPage, CercasMapaPage, VeiculosMapaPage, VeiculosMapaAlertasPage', style({zIndex: 10})),
    state('*', style({zIndex: -1})),

    transition('VeiculosMapaPage => VeiculosMapaAlertasPage', openTo('444')),
    transition('VeiculosMapaAlertasPage => VeiculosMapaPage', closeTo('444')),

    transition('VeiculosCercasPage => CercasMapaPage', openTo('10')),
    transition('CercasMapaPage => VeiculosCercasPage', closeTo('10')),

    transition('* => VeiculosCercasPage', openTo('10')),
    transition('VeiculosCercasPage => *', closeTo('10')),

    transition('* => VeiculosMapaPage', openTo('10')),
    transition('VeiculosMapaPage => *', closeTo('10')),
]);

// App motorista
export const slideOutAnimationMotorista = trigger('routeMotoristaAnimations', [
    state('MotoristaCombustivelPage, MotoristaCombustivelCreatePage', style({zIndex: 10})),
    state('MotoristaRotasPage, MotoristaRotasPageDetails, MotoristaRotasPageCheckin', style({zIndex: 10})),
    state('*', style({zIndex: -1})),

    // Combustivel page
    transition('MotoristaCombustivelPage => MotoristaCombustivelCreatePage', openTo('10')),
    transition('MotoristaCombustivelCreatePage => MotoristaCombustivelPage', closeTo('10')),
    
    // Rotas page
    transition('MotoristaRotasPage => MotoristaRotasPageDetails', openTo('10')),
    transition('MotoristaRotasPageDetails => MotoristaRotasPage', closeTo('10')),
    transition('MotoristaRotasPageDetails => MotoristaRotasPageCheckin', openTo('10')),
    transition('MotoristaRotasPageCheckin => MotoristaRotasPageDetails', closeTo('10')),

    transition('* => MotoristaCombustivelPage', openTo('10')),
    transition('MotoristaCombustivelPage => *', closeTo('10')),
    transition('* => MotoristaRotasPage', openTo('10')),
]);


export const slideInOutAnimation = trigger('routeClienteAnimations', [
    transition(
        'HistoricoPage => HistoricoListaPage,'
        + 'HistoricoPage => HistoricoDesenhoPage,'
        + 'HistoricoPage => HistoricoReplayPage,'
        + 'HistoricoPage => HistoricoParadasPage,'
        + 'HistoricoPage => HistoricoViagensPage,'
        + 'CompartilharPage => CompartilharCreatePage', 
        slideTo('right')
    ),
    transition(
        'HistoricoListaPage => HistoricoPage,'
        + 'HistoricoDesenhoPage => HistoricoPage,'
        + 'HistoricoReplayPage => HistoricoPage,'
        + 'HistoricoParadasPage => HistoricoPage,'
        + 'HistoricoViagensPage => HistoricoPage,'
        + 'CompartilharCreatePage => CompartilharPage',
        slideTo('left')
    )
]);
function slideTo(direction: string, zIndex: string = 'auto') {
    const optional = { optional: true };
    return [
        query(':enter, :leave', 
            style({
                position: 'absolute',
                width: '100%',
                height: '100%',
                [direction]: 0,
                top: 0
            }), 
            optional
        ),
        query(':self', style({ zIndex: zIndex }), optional),
        query(':enter', style({ [direction]:'-100%'}), optional),
        group([
            query(':leave', [
                animate('.6s ease', style({ [direction]: '100%' }))
            ], optional),
            query(':enter', [
                animate('0.6s ease', style({ [direction]: '0%' }))
            ], optional),
        ])
    ];
}
function openTo(zIndex: string = 'auto') {
    const optional = { optional: true };
    return [
        query(':enter, :leave', 
            style({
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0
            }), 
            optional
        ),
        query(':self', style({ zIndex: zIndex }), optional),
        query(':enter', style({ top:'25%', opacity:0, zIndex: zIndex }), optional),
        group([
            query(':enter', [
                animate('0.3s ease', style({ top: 0, opacity: 1 }))
            ], optional),
        ])
    ];
}
function closeTo(zIndex: string = 'auto') {
    const optional = { optional: true };
    return [
        query(':enter, :leave', 
            style({
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                opacity: 1
            }), 
            optional
        ),
        query(':self', style({ zIndex: zIndex }), optional),
        query(':leave', style({ zIndex: zIndex }), optional),
        group([
            query(':leave', [
                animate('0.2s ease', style({ top: "25%", opacity: 0 }))
            ], optional),
        ])
    ];
}

export const showRouterVeiculos = trigger('routerVeiculos', [
    state('opened', style({
        zIndex: 10
    })),
    state('closed', style({
       zIndex: -1
    }))
]);


export const showRouterPainelMotoristas = trigger('routerPainelMotoristas', [
    state('opened', style({
        zIndex: 10
    })),
    state('closed', style({
       zIndex: -1
    }))
]);


export const contentLoading = trigger('loadingContentShowHidden', [
    state('opened', style({
        padding: '1.2rem 1.4rem'
    })),
    state('closed', style({
        padding: 0,
        width: 0,
        height: 0
    })),
    transition('closed => opened', [
        animate('70ms', style({ padding: '1.2rem 1.4rem' })),
    ]),
]);


export const openLoading = trigger('loadingOpen', [
    state('opened', style({})),
    state('closed', style({
       display: 'none'
    })),
    transition('opened => closed', [
        query('@loadingContentShowHidden', [
            animate('100ms', style({ padding:0,width:0,height:0 })),
        ]),
    ]),
]);


export const showActionSheet = trigger('actionSheetShow', [
    state('opened', style({
        marginBottom: "0"
    })),
    state('closed', style({
       marginBottom: "-120%"
    })),
    transition('closed => opened', [
        animate('70ms', style({ marginBottom: "0" }))
    ])
]);

export const showMessageModal = trigger('messageModalShow', [
    state('opened', style({
        opacity: 1,
    })),
    state('closed', style({
        opacity: 0,
    })),
    transition('closed => opened', [
        animate('110ms', style({ opacity: 1 }))
    ]),
    transition('opened => closed', [
        animate('90ms', style({ opacity: 0 }))
    ])
]);


export const showSelectVeiculos = trigger('selectVeiculosShow', [
    state('opened', style({
        bottom: "0",
        zIndex: "13"
    })),
    state('closed', style({
        bottom: "-120%",
        zIndex: "-1"
    })),
    transition('closed => opened', [
        style({zIndex:"13"}),
        animate('400ms', style({ bottom: "0" }))
    ]),
    transition('opened => closed', [
        animate('300ms', style({ bottom: "-120%", zIndex:"-1" }))
    ]),
]);
//
//  TopicView.h
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/22/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface TopicView : UIView

@property (strong, nonatomic) IBOutlet UIButton *button;
@property (strong, nonatomic) IBOutlet UIButton *detailButton;
@property (strong, nonatomic) NSString *name;
@property (strong, nonatomic) NSURL *url;

@end

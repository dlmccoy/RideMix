//
//  UserParamsViewController.h
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/16/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <FacebookSDK/FacebookSDK.h>

@interface UserParamsViewController : UIViewController

@property (strong, nonatomic) NSString *userID;
@property (strong, nonatomic) NSString *name;
@property (strong, nonatomic) NSMutableArray *paramStrings;
@property (strong, nonatomic) IBOutlet UILabel *nameLabel;
@property (strong, nonatomic) IBOutlet FBProfilePictureView *profilePicView;
@property (strong, nonatomic) IBOutletCollection(UILabel) NSArray *paramsLabels;

@end

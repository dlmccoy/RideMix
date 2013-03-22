//
//  FacebookFriendCell.h
//  RideMix
//
//  Created by Alejandro Rodriguez on 3/22/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <FacebookSDK/FacebookSDK.h>

@interface FacebookFriendCell : UITableViewCell

@property (strong, nonatomic) IBOutlet FBProfilePictureView *profilePictureView;
@property (strong, nonatomic) IBOutlet UILabel *nameLabel;

@end

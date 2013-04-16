//
//  StartViewController.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 3/22/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "StartViewController.h"
#import <FacebookSDK/FacebookSDK.h>
#import "AppDelegate.h"

@interface StartViewController ()

@end

@implementation StartViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // if the session is open, then load the data for our view controller
    AppDelegate *appDelegate = [[UIApplication sharedApplication]delegate];
    if (!appDelegate.session.isOpen) {
        // create a fresh session object
        appDelegate.session = [[FBSession alloc] init];
        
        [appDelegate.session openWithCompletionHandler:^(FBSession *session,
                                                             FBSessionState status,
                                                             NSError *error) {
            }];
    }
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
